import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { createClient } from "@/lib/supabase/server";
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
  const navItems: INavItem[] = [
    {
      id: uuidv4(),
      label: "Home",
      href: "/",
      type: "equals",
    },
    {
      id: uuidv4(),
      label: "Find Jobs",
      href: "/jobs",
      type: "startswith",
    },
    {
      id: uuidv4(),
      label: "Features",
      href: "/#howwehelp",
      type: "includes",
    },
    {
      id: uuidv4(),
      label: "FAQs",
      href: "/#faq",
      type: "includes",
    },
    {
      id: uuidv4(),
      label: "Hire",
      href: "/auth/login?company=true",
      type: "includes",
    },
  ];
  return (
    <>
      <NavbarParent user={user} navItems={navItems} />
      {children}
    </>
  );
}
