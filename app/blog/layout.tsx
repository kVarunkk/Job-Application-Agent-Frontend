import Footer from "@/components/landing-page/Footer";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { v4 as uuidv4 } from "uuid";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems: INavItem[] = [
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
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <NavbarParent navItems={navItems} />
        <div className="px-4 py-3 lg:px-32 xl:px-48 2xl:px-[25rem]">
          {children}
        </div>
        <Footer />
      </div>
      <ScrollToTopButton />
    </main>
  );
}
