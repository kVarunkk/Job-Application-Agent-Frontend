import NavbarComponent from "@/components/Navbar";
import { OnboardingForm } from "@/components/OnboardingComponent";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function GetStartedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <div>
      <NavbarComponent
        user={user}
        items={[
          <Link
            key={uuidv4()}
            href={"/jobs"}
            className="hover:underline underline-offset-2"
          >
            Find Jobs
          </Link>,
        ]}
      />

      <OnboardingForm />
    </div>
  );
}
