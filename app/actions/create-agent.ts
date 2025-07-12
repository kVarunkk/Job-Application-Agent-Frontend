"use server";

import { createClient } from "@/lib/supabase/server";
import { agentConfigs, baseSchema, ycSchema } from "@/lib/agentSchemas";
import { TAgentType } from "@/lib/types";
import { z } from "zod";

export async function createAgent(prevState: any, formData: FormData) {
  try {
    const agentType = formData.get("agentType") as TAgentType;
    const config = agentConfigs[agentType];
    const platformId = formData.get("platformId") as string;

    if (!config) {
      return { success: false, error: "Unsupported agent type." };
    }

    // Dynamically build values to validate
    const values: Record<string, any> = {};
    for (const [key] of Object.entries(config.schema.shape)) {
      values[key] = formData.get(key);
    }

    const parsed:
      | z.SafeParseSuccess<z.infer<typeof baseSchema | typeof ycSchema>>
      | z.SafeParseError<z.infer<typeof baseSchema | typeof ycSchema>> =
      config.schema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    const resumeFile = formData.get("resume") as File;
    if (!resumeFile || resumeFile.type !== "application/pdf") {
      return { success: false, error: "Invalid or missing resume file" };
    }

    const supabase = await createClient();
    const { data: authUser, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser?.user?.id) {
      return { success: false, error: "Not authenticated" };
    }

    const user_id = authUser.user.id;
    const user_email = authUser.user.email;
    const fileName = `resume-${crypto.randomUUID()}.pdf`;
    const filePath = `resumes/${user_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(filePath, resumeFile, {
        contentType: "application/pdf",
      });

    if (uploadError) {
      return { success: false, error: "Resume upload failed" };
    }

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: parsed.data.name,
        user_id,
        user_email,
        resume_path: filePath,
        filter_url: parsed.data.filter_url,
        type: platformId,
      })
      .select()
      .single();

    if (insertError || !agent) {
      return { success: false, error: insertError?.message };
    }

    // If agent has post-insert handler (like for YC credentials)
    if ("postInsert" in config && typeof config.postInsert === "function") {
      await config.postInsert(
        agent,
        parsed.data as z.infer<typeof ycSchema>,
        supabase
      );
    }

    return { success: true, agentId: agent.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
