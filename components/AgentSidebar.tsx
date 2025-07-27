"use client";

import { cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import CreateAgentDialog from "./CreateAgentDialog";
import { createClient } from "@/lib/supabase/client";
import AgentSidebarBtn from "./AgentSidebarBtn";
import { User } from "@supabase/supabase-js";
import { Agent } from "@/lib/types";
import ProfileDropdown from "./ProfileDropdown";

interface AgentSidebarProps {
  screen: "lg" | "sm";
  user: User | null;
}

export default function AgentSidebar({ screen, user }: AgentSidebarProps) {
  const [open, setOpen] = useState(true);
  const [sidebarAgents, setSidebarAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
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
    } catch {
      console.error("Could not update the agents.");
    }
  }, [fetchAgents]);

  useEffect(() => {
    (async () => {
      try {
        await fetchAgents();
      } catch {
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
        <Link href={"/jobs"}>
          <Button variant={"ghost"} className="w-full !justify-start !gap-5">
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
            {open && "Jobs"}
          </Button>
        </Link>
        <ThemeSwitcher sidebarOpen={open} />
        {user && (
          <ProfileDropdown user={user} open={open} isAgentSidebar={true} />
        )}
      </div>
    </div>
  );
}
