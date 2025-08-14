import Error from "@/components/Error";
import NavbarComponent from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    return (
      <div className="h-screen w-screen">
        <NavbarComponent
          user={user}
          items={[
            <Link
              key={uuidv4()}
              href={"/company"}
              className="hover:underline underline-offset-2"
            >
              Home
            </Link>,
            <Link
              key={uuidv4()}
              href={"/company/job-posts"}
              className="hover:underline underline-offset-2"
            >
              Job Posts
            </Link>,
            <Link
              key={uuidv4()}
              href={"/company/applicants"}
              className="hover:underline underline-offset-2"
            >
              Applicants
            </Link>,
            <Link
              key={uuidv4()}
              href={"/get-started?company=true&edit=true"}
              className="hover:underline underline-offset-2"
            >
              Edit Profile
            </Link>,
          ]}
        />

        <div className="w-full px-4 py-3 lg:px-20 xl:px-40 2xl:px-80">
          {children}
        </div>
      </div>
    );
  } catch {
    return <Error />;
  }
}
