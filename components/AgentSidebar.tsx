"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { usePathname } from "next/navigation";
import CreateAgentDialog from "./CreateAgentDialog";
import AgentDeleteDialog from "./AgentDeleteDialog";
import AgentInformation from "./AgentInformation";
import { createClient } from "@/lib/supabase/client";

interface AgentSidebarProps {
  agents?: Agent[];
}

export default function AgentSidebar({ agents }: AgentSidebarProps) {
  const [open, setOpen] = useState(true);
  const [sidebarAgents, setSidebarAgents] = useState<Agent[]>(agents ?? []);
  const pathname = usePathname();
  const [loading, setLoading] = useState(agents ? false : true);

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

  const updateSidebarAfterUpdation = async () => {
    try {
      fetchAgents();
    } catch (error) {
      console.error("Could not update the agents.");
    }
  };

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
        agents ? " border-r p-4" : "",
        {
          "w-20": !open,
          "w-64": open && agents,
          "w-full": open && !agents,
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
        {agents && (
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
            <div
              key={agent.id}
              className={cn(
                "flex items-center justify-between group p-2 rounded-md hover:bg-muted transition",
                pathname === "/agent/" + agent.id
                  ? "bg-muted font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <Link
                key={agent.id}
                href={"/agent/" + agent.id}
                className={cn("flex-1")}
              >
                {agent.name}
              </Link>

              <AgentInformation
                agent={agent}
                updateSidebarAfterUpdation={updateSidebarAfterUpdation}
              />

              <AgentDeleteDialog
                agentId={agent.id}
                updateSidebarAgentsAfterDeletion={
                  updateSidebarAgentsAfterDeletion
                }
              />
            </div>
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
