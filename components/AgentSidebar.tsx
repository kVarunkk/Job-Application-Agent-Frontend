"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  MoreVertical,
  Pencil,
  Plus,
  Settings,
  Trash,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname } from "next/navigation";
import CreateAgentDialog from "./CreateAgentDialog";
import AgentDeleteDialog from "./AgentDeleteDialog";
import AgentInformation from "./AgentInformation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import AgentSidebarBtn from "./AgentSidebarBtn";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface AgentSidebarProps {
  screen: "lg" | "sm";
  user: User | null;
}

export default function AgentSidebar({ screen, user }: AgentSidebarProps) {
  const [open, setOpen] = useState(true);
  const [sidebarAgents, setSidebarAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const fetchAgents = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      setSidebarAgents(data);
    } catch (error) {
      throw error;
    }
  }, []);

  const updateSidebarAgentsAfterDeletion = useCallback(
    (agentId: string) => {
      setSidebarAgents((prevAgents) =>
        prevAgents.filter((agent) => agent.id !== agentId)
      );
    },
    [setSidebarAgents]
  );

  const updateSidebarAfterUpdation = useCallback(async () => {
    try {
      fetchAgents();
    } catch (error) {
      console.error("Could not update the agents.");
    }
  }, [fetchAgents]);

  useEffect(() => {
    (async () => {
      try {
        await fetchAgents();
      } catch (error) {
        console.error("Could not update the agents.");
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchAgents]);

  return (
    <div
      className={cn(
        "flex max-h-screen h-full flex-col gap-5 transition-all",
        screen === "lg" ? " border-r p-4" : "",
        {
          "w-20": !open,
          "w-64": open && screen === "lg",
          "w-full": open && !(screen === "lg"),
        }
      )}
    >
      <div
        className={cn(
          "flex items-center",
          open ? "justify-between" : "justify-center"
        )}
      >
        {open && <h2 className="text-lg font-semibold">Agents</h2>}
        {screen === "lg" && (
          <Button
            className="text-muted-foreground"
            variant={"ghost"}
            onClick={() => setOpen(!open)}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        )}
      </div>

      <CreateAgentDialog
        triggerBtn={
          open ? (
            <Button variant={"outline"} className="truncate">
              <Plus />
              Create New Agent
            </Button>
          ) : (
            <Button className="text-muted-foreground" variant={"ghost"}>
              <Plus className="h-4 w-4" />
            </Button>
          )
        }
      />

      {loading && (
        <div className="text-muted-foreground text-sm mt-20 text-center">
          Loading...
        </div>
      )}

      {open && (
        <div className="overflow-y-auto flex flex-col gap-2 flex-1">
          {sidebarAgents.map((agent) => (
            <AgentSidebarBtn
              key={agent.id}
              agent={agent}
              updateSidebarAfterUpdation={updateSidebarAfterUpdation}
              updateSidebarAgentsAfterDeletion={
                updateSidebarAgentsAfterDeletion
              }
            />
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2 mt-auto">
        <ThemeSwitcher sidebarOpen={open} />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"ghost"}
                className={`!gap-3  ${
                  open ? "!justify-start" : "!justify-center"
                }`}
              >
                <Avatar className="bg-muted h-6 w-6">
                  <AvatarImage src="/" />
                  <AvatarFallback className="text-xs uppercase">
                    {user.email?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                {open && <span>Account</span>}
              </Button>
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
