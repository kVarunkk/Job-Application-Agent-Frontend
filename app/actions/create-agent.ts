"use server";

import { encryptAES, encryptWithKEK, generateAESKey } from "@/lib/encryption";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2),
  filter_url: z.string().url(),
  yc_username: z.string(),
  yc_password: z.string().min(4),
});

export async function createAgent(prevState: any, formData: FormData) {
  try {
    const parsed = formSchema.safeParse({
      name: formData.get("name"),
      filter_url: formData.get("filter_url"),
      yc_username: formData.get("yc_username"),
      yc_password: formData.get("yc_password"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    const { name, filter_url, yc_username, yc_password } = parsed.data;
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

    // Generate file path and name
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

    // Insert agent with resume file path (not public URL)
    const { data: agent, error: insertError } = await supabase
      .from("agents")
      .insert({ name, filter_url, user_id, resume_path: filePath })
      .select()
      .single();

    if (insertError || !agent) {
      return { success: false, error: insertError?.message };
    }

    // 2. Encrypt password using AES, then encrypt AES key with KEK
    const aesKey = generateAESKey();
    const encryptedPassword = encryptAES(yc_password, aesKey);
    const kek = process.env.KEK_SECRET!;
    const encryptedAESKey = encryptWithKEK(aesKey, kek);

    // 3. Store in encrypted credentials table
    const { error: credError } = await supabase
      .from("encrypted_credentials_yc")
      .insert({
        agent_id: agent.id,
        username: yc_username,
        password_enc: encryptedPassword,
        aes_key_enc: encryptedAESKey,
      });

    if (credError) {
      return { success: false, error: credError.message };
    }

    return { success: true, agentId: agent.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
