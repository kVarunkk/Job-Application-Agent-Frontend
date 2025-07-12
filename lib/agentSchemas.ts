import { z } from "zod";

export const baseSchema = z.object({
  name: z.string().min(2),
  agentType: z.string(),
  filter_url: z.string().url(),
});

export const ycSchema = z.object({
  ...baseSchema.shape,
  yc_username: z.string(),
  yc_password: z.string().min(4),
});

export const agentConfigs = {
  ycombinator: {
    schema: ycSchema,
    async postInsert(
      agent: any,
      data: z.infer<typeof ycSchema>,
      supabase: any
    ) {
      const { encryptAES, encryptWithKEK, generateAESKey } = await import(
        "@/lib/encryption"
      );
      const aesKey = generateAESKey();
      const encryptedPassword = encryptAES(data.yc_password, aesKey);
      const kek = process.env.KEK_SECRET!;
      const encryptedAESKey = encryptWithKEK(aesKey, kek);

      const { error } = await supabase.from("encrypted_credentials_yc").insert({
        agent_id: agent.id,
        username: data.yc_username,
        password_enc: encryptedPassword,
        aes_key_enc: encryptedAESKey,
      });

      if (error) throw new Error(error.message);
    },
  },
  remoteok: {
    schema: baseSchema,
  },
} as const;
