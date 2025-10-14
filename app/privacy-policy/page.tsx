import FootComponent from "@/components/FootComponent";
import Footer from "@/components/landing-page/Footer";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { v4 as uuidv4 } from "uuid";

export default async function PrivacyPolicyPage() {
  const navItems: INavItem[] = [
    {
      id: uuidv4(),
      label: "Home",
      href: "/",
      type: "equals",
    },
    {
      id: uuidv4(),
      label: "Jobs",
      href: "/jobs",
      type: "startswith",
    },
    {
      id: uuidv4(),
      label: "Companies",
      href: "/companies",
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
      href: "/hire",
      type: "includes",
    },
  ];
  return (
    <>
      <NavbarParent navItems={navItems} />
      <PrivacyPolicy />
      <div className="px-4 lg:px-20 xl:px-40 2xl:px-80 my-20">
        <FootComponent />
      </div>
      <Footer />
    </>
  );
}
