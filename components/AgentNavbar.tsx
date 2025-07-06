"use client";

import { Hamburger, LogOut, Menu, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import AgentSidebar from "./AgentSidebar";
import CreateWorkflowDialog from "./CreateWorkflowDialog";

interface AgentNavbarProps {
  agent?: Agent;
  user: User | null;
}

export default function AgentNavbar({ agent, user }: AgentNavbarProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <div className="absolute z-10 p-4 bg-transparent w-full flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Sheet>
          <SheetTrigger className="lg:hidden">
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetHeader className="hidden">
              <SheetTitle></SheetTitle>
            </SheetHeader>
            <AgentSidebar screen="sm" />
          </SheetContent>
        </Sheet>
        <h1 className="text-2xl font-bold">
          {agent ? `${agent.name}` : "Agent"}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {user && <CreateWorkflowDialog />}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="bg-muted">
                <AvatarImage src="/" />
                <AvatarFallback className="text-primary uppercase">
                  {user.email?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuItem disabled>
                <Settings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
