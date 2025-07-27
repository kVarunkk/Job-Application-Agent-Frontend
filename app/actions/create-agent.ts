"use server";

import { createClient } from "@/lib/supabase/server";
import {
  agentConfigs,
  createAgentSchema, // Import the top-level discriminated union schema
  // No longer directly importing baseSchema, uplersSchema, ycSchema here
  // as createAgentSchema is the main parsing schema
} from "@/lib/agentSchemas";
import { TAgentType } from "@/lib/types"; // Assuming TAgentType is 'ycombinator' | 'uplers' | 'remoteok'

type AgentId = string;

type FormStateSuccess = {
  success: true;
  agentId: AgentId;
  error?: undefined;
};

type FormStateError = {
  success: false;
  error: string; // Error should always be a string when success is false
  agentId?: undefined;
};

export type FormState = FormStateSuccess | FormStateError;

export async function createAgent(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    // 1. Parse the entire formData using the discriminated union schema
    const parsed = createAgentSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      // Zod's error.message provides detailed validation errors
      return { success: false, error: parsed.error.message };
    }

    // Now, parsed.data is a discriminated union (e.g., z.infer<typeof ycSchema> or z.infer<typeof uplersSchema>)
    // And its 'agentType' property is guaranteed to be one of the literal types.
    const agentType = parsed.data.agentType as TAgentType; // Use parsed.data.agentType
    const config = agentConfigs[agentType];

    // platformId might come from parsed.data if it's part of your schema,
    // otherwise, handle it separately if it's a generic ID not tied to schema
    // const platformId = parsed.data.somePlatformIdField; // Example if it's in schema
    // If platformId is truly separate, ensure TAgentType can map to it,
    // or use agentType itself as the platformId if they are equivalent.
    const platformId = agentType; // Assuming platformId in DB is same as agentType for simplicity

    if (!config) {
      // This should ideally not happen if TAgentType is correctly derived from agentConfigs keys
      return { success: false, error: "Unsupported agent type configuration." };
    }

    const resumeFile = formData.get("resume") as File;
    if (!resumeFile || resumeFile.type !== "application/pdf") {
      return {
        success: false,
        error: "Invalid or missing resume file (must be PDF).",
      };
    }

    const supabase = await createClient();
    const { data: authUser, error: userError } = await supabase.auth.getUser();
    if (userError || !authUser?.user?.id) {
      return { success: false, error: "Not authenticated." };
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
      return { success: false, error: "Resume upload failed." };
    }

    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({
        name: parsed.data.name,
        user_id,
        user_email,
        resume_path: filePath,
        filter_url: parsed.data.filter_url,
        type: platformId, // Using agentType as platformId
      })
      .select()
      .single();

    if (insertError || !agent) {
      return {
        success: false,
        error: insertError?.message || "Failed to create agent in DB.",
      };
    }

    // If agent has post-insert handler (like for YC credentials)
    // TypeScript will now correctly narrow 'config' and 'parsed.data' here
    // No explicit 'as' cast needed for parsed.data
    if (config.postInsert) {
      await config.postInsert(
        agent,
        //@ts-expect-error TS wants a union, but the function expects an intersection.
        parsed.data, // This is now correctly typed
        supabase
      );
    }

    return { success: true, agentId: agent.id };
  } catch (err: unknown) {
    // Ensure error message is always a string
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
