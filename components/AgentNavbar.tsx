"use client";

import { Menu } from "lucide-react";
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
import { useCallback, useEffect, useState } from "react";
import WorkflowStatusSheet from "./WorkflowStatusSheet";
import { Badge } from "./ui/badge";
import { Agent } from "@/lib/types";

interface AgentNavbarProps {
  agent?: Agent;
  user: User | null;
}

export default function AgentNavbar({ agent, user }: AgentNavbarProps) {
  const [agentState, setAgentState] = useState<Agent>();

  const updateAgent = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("agents")
      .select(
        "id, created_at, filter_url, name, resume_path, updated_at, user_id, workflows(*), platforms(*)"
      )
      .eq("id", agent?.id)
      .single();
    console.log(data);
    if (data) setAgentState(data as unknown as Agent);
  }, [agent?.id]);

  useEffect(() => {
    updateAgent();
  }, [updateAgent]);

  return (
    <div className="absolute z-10 p-4 bg-transparent w-full flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Sheet>
          <SheetTrigger className="lg:hidden">
            <Menu />
          </SheetTrigger>
          <SheetContent side={"left"}>
            <SheetHeader className="hidden">
              <SheetTitle></SheetTitle>
            </SheetHeader>
            <AgentSidebar screen="sm" user={user} />
          </SheetContent>
        </Sheet>
        <h1 className="sm:text-2xl font-bold truncate whitespace-nowrap overflow-hidden max-w-[100px] sm:max-w-[300px]">
          {agentState ? `${agentState.name}` : "Agent"}
        </h1>
        {agentState && agentState.platforms && (
          <Badge className="ml-2">{agentState.platforms.name}</Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user &&
          agentState &&
          (agentState.workflows.length > 0 ? (
            <WorkflowStatusSheet agent={agentState} />
          ) : (
            <CreateWorkflowDialog
              agent={agentState}
              updateAgent={updateAgent}
            />
          ))}
      </div>
    </div>
  );
}
