import FAQSection from "@/components/landing-page/FAQSection";
import Footer from "@/components/landing-page/Footer";
import Hero from "@/components/landing-page/Hero";
import { HowWeHelp } from "@/components/landing-page/HowWeHelp";
import TheGetHiredAdvantageSection from "@/components/landing-page/TheGetHiredAdvantageSection";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { v4 as uuidv4 } from "uuid";

export default async function Home() {
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
      label: "Hire",
      href: "/auth/login?company=true",
      type: "includes",
    },
  ];
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <NavbarParent navItems={navItems} />
        <div className="flex-1 flex flex-col gap-32  w-full">
          <Hero />
          <HowWeHelp />
          <TheGetHiredAdvantageSection />
          <FAQSection />
          <Footer />
        </div>
      </div>
    </main>
  );
}
