"use client";

import { Loader2, Pause, Play, PlayCircle, RefreshCcw } from "lucide-react";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useState } from "react";
import { IWorkflow } from "@/lib/types";

interface WorkflowControlsProps {
  workflow: IWorkflow;
  fetchWorkflow: () => Promise<void>;
  updateWorkflow: (checked: boolean) => Promise<void>;
  triggerWorkflow: () => Promise<void>;
}

export default function WorkflowControls({
  workflow,
  fetchWorkflow,
  updateWorkflow,
  triggerWorkflow,
}: WorkflowControlsProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [switchState, setSwitchState] = useState(!workflow.pause);
  const [triggerLoading, setTriggerLoading] = useState(workflow.running);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWorkflow();
    setRefreshing(false);
  };

  return (
    <div className="flex items-center gap-3 mb-4">
      <Button
        variant={"ghost"}
        onClick={async () => {
          setTriggerLoading(true);
          await triggerWorkflow();
          setTriggerLoading(false);
        }}
        disabled={triggerLoading}
      >
        {triggerLoading ? (
          <Loader2 className="h-4 w-4 transition-transform animate-spin" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
      </Button>
      <Button variant={"ghost"} onClick={handleRefresh}>
        <RefreshCcw
          className={`h-4 w-4 transition-transform ${
            refreshing ? "animate-spin" : ""
          }`}
        />
      </Button>
      <div className="flex items-center gap-1">
        <Pause className="h-4 w-4" />
        <Switch
          checked={switchState}
          onCheckedChange={(checked) => {
            setSwitchState(checked);
            updateWorkflow(checked);
          }}
        />
        <Play className="h-4 w-4" />
      </div>
    </div>
  );
}
