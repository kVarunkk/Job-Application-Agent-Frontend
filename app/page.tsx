import NavbarComponent from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
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
            <Link
              key={uuidv4()}
              href={"/features"}
              className="hover:underline underline-offset-2"
            >
              Features
            </Link>,
            <Link
              key={uuidv4()}
              href={"/pricing"}
              className="hover:underline underline-offset-2"
            >
              Pricing
            </Link>,
          ]}
        />
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5"></div>
      </div>
    </main>
  );
}
