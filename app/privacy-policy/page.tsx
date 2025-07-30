import Footer from "@/components/landing-page/Footer";
import NavbarComponent from "@/components/Navbar";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function PrivacyPolicyPage() {
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
            href={"/"}
            className="hover:underline underline-offset-2"
          >
            Home
          </Link>,
          <Link
            key={uuidv4()}
            href={"/jobs"}
            className="hover:underline underline-offset-2"
          >
            Find Jobs
          </Link>,
          <Link
            key={uuidv4()}
            href={"#howwehelp"}
            className="hover:underline underline-offset-2"
          >
            Features
          </Link>,
          <Link
            key={uuidv4()}
            href={"#faq"}
            className="hover:underline underline-offset-2"
          >
            FAQs
          </Link>,
        ]}
      />
      <PrivacyPolicy />
      <Footer />
    </>
  );
}
