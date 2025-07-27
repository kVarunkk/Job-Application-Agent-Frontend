"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import WorkflowSheetConfigForm from "./WorkflowSheetConfigForm";
import WorkflowSheetStatusComponent from "./WorkflowSheetStatusComponent";
import WorkflowControls from "./WorkflowControls";
import { Agent, IWorkflow } from "@/lib/types";

interface WorkflowStatusSheetProps {
  agent: Agent;
}

export default function WorkflowStatusSheet({
  agent,
}: WorkflowStatusSheetProps) {
  const [workflow, setWorkflow] = useState<IWorkflow>();
  const supabase = createClient();

  const fetchWorkflow = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("workflows")
        .select("*, workflow_runs(*), agents(platforms(*))")
        .eq("agent_id", agent.id)
        .single();

      if (error) throw error;

      if (!error && data) {
        setWorkflow(data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [agent, supabase]);

  const updateWorkflow = useCallback(
    async (checked: boolean) => {
      try {
        const { data, error } = await supabase
          .from("workflows")
          .update({
            pause: !checked,
          })
          .eq("agent_id", agent.id)
          .select("*, workflow_runs(*), agents(platforms(*))")
          .single();
        if (error) throw error;
        if (!error && data) {
          setWorkflow(data);
        }
      } catch (e) {
        console.error(e);
      }
    },
    [agent, supabase]
  );

  const triggerWorkflow = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("workflows")
        .update({
          running: true,
          pause: false,
        })
        .eq("agent_id", agent.id);
      if (error) throw error;

      fetchWorkflow();

      const session = await supabase.auth.getSession();

      if (!session.data.session?.access_token) {
        throw new Error("User is not authenticated");
      }

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/run-workflow/" + agent.id,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Backend error:", errorData.detail || errorData);
      }

      const data = await res.json();

      if (data.status !== "success") {
        throw new Error("Unexpected response:", data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      const { error } = await supabase
        .from("workflows")
        .update({
          running: false,
        })
        .eq("agent_id", agent.id);
      if (error) throw error;
      fetchWorkflow();
    }
  }, [agent, fetchWorkflow, supabase]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"ghost"}>Workflow</Button>
      </SheetTrigger>
      <SheetContent className="!w-full sm:!max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Workflow</SheetTitle>
          <SheetDescription>
            See the status of your workflow and update the configuration
          </SheetDescription>
        </SheetHeader>
        {workflow && (
          <Tabs defaultValue="status" className="w-full mt-5">
            <div className="flex flex-wrap items-center justify-between">
              <TabsList className="mb-4">
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
              </TabsList>
              <WorkflowControls
                workflow={workflow}
                fetchWorkflow={fetchWorkflow}
                updateWorkflow={updateWorkflow}
                triggerWorkflow={triggerWorkflow}
              />
            </div>
            <TabsContent value="status">
              <WorkflowSheetStatusComponent workflow={workflow} />
            </TabsContent>
            <TabsContent value="config">
              <WorkflowSheetConfigForm
                workflow={workflow}
                fetchWorkflow={fetchWorkflow}
              />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
