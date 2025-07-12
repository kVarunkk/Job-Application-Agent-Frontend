"use server";

import { encryptAES, encryptWithKEK, generateAESKey } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ycSchema = z.object({
  name: z.string().min(2),
  agentType: z.enum(["ycombinator", "remoteok"]),
  filter_url: z.string().url(),
  yc_username: z.string(),
  yc_password: z.string().min(4),
});

const baseSchema = z.object({
  name: z.string().min(2),
  agentType: z.enum(["ycombinator", "remoteok"]),
  filter_url: z.string().url(),
});

export async function createAgent(prevState: any, formData: FormData) {
  try {
    const agentType = formData.get("agentType");
    const name = formData.get("name");

    let parsed;

    switch (agentType) {
      case "ycombinator":
        parsed = ycSchema.safeParse({
          name,
          agentType,
          filter_url: formData.get("filter_url"),
          yc_username: formData.get("yc_username"),
          yc_password: formData.get("yc_password"),
        });
        break;
      case "remoteok":
        parsed = baseSchema.safeParse({
          name,
          agentType: formData.get("agentType"),
          filter_url: formData.get("filter_url"),
        });
        break;
      default:
        return { success: false, error: "Unknown agent type" };
    }

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
      console.log("Upload error:", uploadError);
      return { success: false, error: "Resume upload failed" };
    }

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: parsed.data.name,
        user_id,
        user_email,
        resume_path: filePath,
        filter_url:
          parsed.data.agentType === "ycombinator"
            ? (parsed.data as z.infer<typeof ycSchema>).filter_url
            : (parsed.data as z.infer<typeof baseSchema>).filter_url,
        type: parsed.data.agentType,
      })
      .select()
      .single();

    if (insertError || !agent) {
      return { success: false, error: insertError?.message };
    }

    if (parsed.data.agentType === "ycombinator") {
      // Type guard to assert yc_password and yc_username exist
      const ycData = parsed.data as z.infer<typeof ycSchema>;
      const aesKey = generateAESKey();
      const encryptedPassword = encryptAES(ycData.yc_password, aesKey);
      const kek = process.env.KEK_SECRET!;
      const encryptedAESKey = encryptWithKEK(aesKey, kek);

      const { error: credError } = await supabase
        .from("encrypted_credentials_yc")
        .insert({
          agent_id: agent.id,
          username: ycData.yc_username,
          password_enc: encryptedPassword,
          aes_key_enc: encryptedAESKey,
        });

      if (credError) {
        return { success: false, error: credError.message };
      }
    }

    return { success: true, agentId: agent.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
