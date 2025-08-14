import NavbarComponent from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <>
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
          <Link
            key={uuidv4()}
            href={"/auth/login?company=true"}
            className="hover:underline underline-offset-2"
          >
            Hire
          </Link>,
        ]}
      />
      {children}
    </>
  );
}
