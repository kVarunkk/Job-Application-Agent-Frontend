"use client";

import { User } from "@supabase/supabase-js";
import { AuthButton } from "./auth-button";
import ProfileDropdown from "./ProfileDropdown";
import Link from "next/link";
import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Brand from "./Brand";
import { cn } from "@/lib/utils";
import { INavItemWithActive } from "./NavbarParent";

export default function NavbarComponent({
  user,
  items,
}: {
  user: User | null;
  items: INavItemWithActive[];
}) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 lg:px-20 xl:px-40 2xl:px-80 border-b">
      <div className="flex items-center gap-4">
        {items ? <NavbarSheet items={items} /> : ""}
        <Link href={"/"}>
          <Brand type="long" />
        </Link>
      </div>
      {items ? (
        <div className=" items-center gap-4 text-sm hidden md:flex">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "hover:underline underline-offset-2",
                item.active && "underline underline-offset-2"
              )}
            >
              {item.label}
            </Link>
          ))}
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

const NavbarSheet = ({ items }: { items: INavItemWithActive[] }) => {
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
              <Brand type="long" />
            </Link>
          </SheetTitle>
        </SheetHeader>

        {items ? (
          <div className="flex flex-col gap-3 items-start ">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "hover:underline underline-offset-2",
                  item.active && "underline underline-offset-2"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : (
          ""
        )}
      </SheetContent>
    </Sheet>
  );
};
