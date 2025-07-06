"use client";

import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Plus,
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

import AgentSidebarBtn from "./AgentSidebarBtn";

interface AgentSidebarProps {
  screen: "lg" | "sm";
}

export default function AgentSidebar({ screen }: AgentSidebarProps) {
  const [open, setOpen] = useState(true);
  const [sidebarAgents, setSidebarAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

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
        "flex h-screen flex-col gap-5 transition-all",
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
            <Button variant={"outline"}>
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
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {open && <div>Theme</div>}
        </div>
      </div>
    </div>
  );
}
