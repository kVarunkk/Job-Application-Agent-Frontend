"use client";

import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfileDropdown({
  user,
  open,
  isAgentSidebar,
}: {
  user: User | null;
  open?: boolean;
  isAgentSidebar: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [isUserInfo, setIsUserInfo] = useState(false);

  const router = useRouter();
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("user_info")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (data && !error) {
        setIsUserInfo(true);
      }
    })();
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isAgentSidebar ? (
          <Button variant="ghost" className="w-full !justify-start !gap-5">
            <AvatarComponent
              user={user}
              open={open}
              isAgentSidebar={isAgentSidebar}
            />

            {open && <span>Account</span>}
          </Button>
        ) : (
          <button>
            <AvatarComponent
              user={user}
              open={open}
              isAgentSidebar={isAgentSidebar}
            />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>
          {user?.user_metadata.full_name || user?.email || "User"}
        </DropdownMenuLabel>
        {isUserInfo ? (
          <DropdownMenuItem>
            <Link
              href={"/get-started?edit"}
              className="w-full flex items-center cursor-default gap-4"
            >
              <UserIcon className="text-muted-foreground  h-4 w-4" /> Edit
              Profile
            </Link>
          </DropdownMenuItem>
        ) : (
          ""
        )}
        {!isAgentSidebar && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {theme === "light" ? (
                <Sun
                  key="light"
                  size={16}
                  className={"text-muted-foreground"}
                />
              ) : theme === "dark" ? (
                <Moon
                  key="dark"
                  size={16}
                  className={"text-muted-foreground"}
                />
              ) : (
                <Laptop
                  key="system"
                  size={16}
                  className={"text-muted-foreground"}
                />
              )}
              <span className="ml-2">Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={(e) => setTheme(e)}
                >
                  <DropdownMenuRadioItem className="flex gap-2" value="light">
                    <Sun size={16} className="text-muted-foreground" />{" "}
                    <span>Light</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className="flex gap-2" value="dark">
                    <Moon size={16} className="text-muted-foreground" />{" "}
                    <span>Dark</span>
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem className="flex gap-2" value="system">
                    <Laptop size={16} className="text-muted-foreground" />{" "}
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4 text-muted-foreground" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AvatarComponent({
  user,
  open,
  isAgentSidebar,
}: {
  user: User | null;
  open?: boolean;
  isAgentSidebar: boolean;
}) {
  return (
    <Avatar
      className={cn(
        "bg-muted",
        open && "-ml-1",
        isAgentSidebar ? "h-6 w-6" : ""
      )}
    >
      <AvatarImage
        src={user?.user_metadata.avatar_url || "/default-avatar.png"}
      />
      <AvatarFallback className="text-xs uppercase">
        {user?.email?.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}
