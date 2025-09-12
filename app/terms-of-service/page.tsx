import Footer from "@/components/landing-page/Footer";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import TermsOfService from "@/components/TermsOfService";
import { v4 as uuidv4 } from "uuid";

export default async function TermsOfServicePage() {
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
      label: "Blog",
      href: "/blog",
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
      <NavbarParent navItems={navItems} />
      <TermsOfService />
      <Footer />
    </>
  );
}
