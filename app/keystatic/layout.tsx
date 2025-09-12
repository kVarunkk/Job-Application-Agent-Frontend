import KeystaticApp from "./keystatic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Create the Keystatic app component
// const { KeystaticApp } = make(keystaticConfig);

export default async function KeystaticPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define the email of the authorized user
  const authorizedEmail = "varunkumawatleap2@gmail.com";

  // Check if the user is authenticated and has the correct email
  if (!user || user.email !== authorizedEmail) {
    // Redirect unauthorized users to the home page
    redirect("/");
  }

  // If the user is authorized, render the Keystatic app
  return <KeystaticApp />;
}
