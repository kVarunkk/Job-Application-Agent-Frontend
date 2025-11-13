"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "./ui/button";
import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function GoogleAuthBtn() {
  const [loading, setLoading] = useState(false);
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };
  return (
    <Button
      variant={"outline"}
      type="button"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
