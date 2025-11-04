"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";

export default function GoogleAuthBtn() {
  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch {}
  };
  return (
    <Button
      variant={"outline"}
      type="button"
      className="w-full"
      onClick={handleGoogleLogin}
    >
      <Image
        src={"/google-icon.svg"}
        height={15}
        width={15}
        alt="Google Icon"
      />
      Log in with Google
    </Button>
  );
}
