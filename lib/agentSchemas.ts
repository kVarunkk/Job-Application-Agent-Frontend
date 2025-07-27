import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Agent } from "./types"; // Assuming Agent has an 'id' property

// 1. Base Schema - does NOT include agentType anymore
export const baseSchema = z.object({
  name: z.string().min(2),
  filter_url: z.string().url(),
});

// 2. Specific Schemas with Literal `agentType`
export const ycSchema = z.object({
  ...baseSchema.shape,
  agentType: z.literal("ycombinator"), // Discriminator
  yc_username: z.string(),
  yc_password: z.string().min(4),
});

export const uplersSchema = z.object({
  ...baseSchema.shape,
  agentType: z.literal("uplers"), // Discriminator
  uplers_username: z.string(),
  uplers_password: z.string().min(4),
});

export const remoteokSchema = z.object({
  ...baseSchema.shape,
  agentType: z.literal("remoteok"), // Discriminator
});

// 3. Overall Discriminated Union Schema for parsing/validation
export const createAgentSchema = z.discriminatedUnion("agentType", [
  ycSchema,
  uplersSchema,
  remoteokSchema,
]);

// 4. Inferred Union Type from the discriminated union schema
type ParsedAgentData = z.infer<typeof createAgentSchema>;

// 5. Generic Type for a single agent config item
type AgentConfigItem<T extends ParsedAgentData> = {
  schema: z.ZodSchema<T>;
  postInsert?: (
    agent: unknown, // Or more specific type for Agent if available (e.g., Agent)
    data: T, // Type of data is specific to the schema for this item
    supabase: SupabaseClient
  ) => Promise<void>;
};

// 6. The agentConfigs object with explicit casting for each item
export const agentConfigs = {
  ycombinator: {
    schema: ycSchema,
    async postInsert(
      agent: unknown,
      data: z.infer<typeof ycSchema>, // Data is specifically YC data here
      supabase: SupabaseClient
    ) {
      const { encryptAES, encryptWithKEK, generateAESKey } = await import(
        "@/lib/encryption"
      );
      const aesKey = generateAESKey();
      const encryptedPassword = encryptAES(data.yc_password, aesKey);
      const kek = process.env.KEK_SECRET!;
      const encryptedAESKey = encryptWithKEK(aesKey, kek);

      const { error } = await supabase.from("encrypted_credentials_yc").insert({
        agent_id: (agent as Agent).id,
        username: data.yc_username,
        password_enc: encryptedPassword,
        aes_key_enc: encryptedAESKey,
      });

      if (error) throw new Error(error.message);
    },
  } as AgentConfigItem<z.infer<typeof ycSchema>>, // Cast for type inference
  remoteok: {
    schema: remoteokSchema, // Corrected: use remoteokSchema, not baseSchema
  } as AgentConfigItem<z.infer<typeof remoteokSchema>>, // Cast for type inference
  uplers: {
    schema: uplersSchema,
    async postInsert(
      agent: unknown,
      data: z.infer<typeof uplersSchema>, // Data is specifically Uplers data here
      supabase: SupabaseClient
    ) {
      const { encryptAES, encryptWithKEK, generateAESKey } = await import(
        "@/lib/encryption"
      );
      const aesKey = generateAESKey();
      const encryptedPassword = encryptAES(data.uplers_password, aesKey);
      const kek = process.env.KEK_SECRET!;
      const encryptedAESKey = encryptWithKEK(aesKey, kek);

      const { error } = await supabase
        .from("encrypted_credentials_uplers")
        .insert({
          agent_id: (agent as Agent).id,
          username: data.uplers_username,
          password_enc: encryptedPassword,
          aes_key_enc: encryptedAESKey,
        });

      if (error) throw new Error(error.message);
    },
  } as AgentConfigItem<z.infer<typeof uplersSchema>>, // Cast for type inference
} as const; // Keep 'as const' to ensure literal keys and deeply immutable types
