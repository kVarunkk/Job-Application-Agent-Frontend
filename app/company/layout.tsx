import Error from "@/components/Error";
import NavbarParent, { INavItem } from "@/components/NavbarParent";
import { v4 as uuidv4 } from "uuid";

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const navItems: INavItem[] = [
      {
        id: uuidv4(),
        label: "Home",
        href: "/company",
        type: "equals",
      },
      {
        id: uuidv4(),
        label: "Job Posts",
        href: "/company/job-posts",
        type: "equals",
      },
      {
        id: uuidv4(),
        label: "Applicants",
        href: "/company/applicants",
        type: "equals",
      },
      {
        id: uuidv4(),
        label: "Profiles",
        href: "/company/profiles",
        type: "equals",
      },
    ];

    return (
      <div className="h-screen w-screen overflow-x-hidden">
        <NavbarParent navItems={navItems} />
        <div className="w-full px-4 py-5 lg:px-20 xl:px-40 2xl:px-80">
          {children}
        </div>
      </div>
    );
  } catch {
    return <Error />;
  }
}
