import { User } from "@supabase/supabase-js";
import { AuthButton } from "./auth-button";
import ProfileDropdown from "./ProfileDropdown";
import Link from "next/link";
import React, { JSXElementConstructor, ReactElement } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Define a type for a ReactElement that is expected to have a 'href' prop
interface HasHrefProps {
  href: string;
  // You might add other common props if needed, e.g., className?: string;
}

export default function NavbarComponent({
  user,
  items,
}: {
  user: User | null;
  // Specify that 'items' is an array of ReactElements whose props extend HasHrefProps
  items?: ReactElement<
    HasHrefProps,
    string | JSXElementConstructor<HasHrefProps>
  >[];
}) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 lg:px-20 xl:px-40 2xl:px-80 border-b">
      <div className="flex items-center gap-4">
        {items ? <NavbarSheet items={items} /> : ""}
        <Link href={"/"}>
          <h1 className="text-xl sm:text-2xl font-bold text-center">
            GetHired
          </h1>
        </Link>
      </div>
      {items ? (
        <div className=" items-center gap-4 text-sm hidden md:flex">
          {items.map((item) =>
            React.cloneElement(item, { key: item.props.href })
          )}
        </div>
      ) : (
        ""
      )}
      <div className="flex items-center gap-5">
        {user ? (
          <ProfileDropdown user={user} isAgentSidebar={false} />
        ) : (
          <div className="">
            <AuthButton />
          </div>
        )}
      </div>
    </div>
  );
}

const NavbarSheet = ({
  items,
}: {
  items?: ReactElement<
    HasHrefProps,
    string | JSXElementConstructor<HasHrefProps>
  >[];
}) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden ">
        <Menu />
      </SheetTrigger>
      <SheetContent
        side={"left"}
        className="overflow-y-auto flex flex-col gap-4 items-start"
      >
        <SheetHeader>
          <SheetTitle>
            <Link href={"/"}>
              <h1 className="text-xl sm:text-2xl font-bold text-center">
                GetHired
              </h1>
            </Link>
          </SheetTitle>
        </SheetHeader>

        {items ? (
          <div className="flex flex-col gap-3 items-start ">
            {items.map((item) =>
              React.cloneElement(item, { key: item.props.href })
            )}
          </div>
        ) : (
          ""
        )}
      </SheetContent>
    </Sheet>
  );
};
