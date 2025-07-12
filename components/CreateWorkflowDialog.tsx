"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import CreateWorkflowForm from "./CreateWorkflowForm";
import { useState } from "react";
import { Agent } from "@/lib/types";

interface CreateWorkflowDialogProps {
  agent: Agent;
  updateAgent: () => Promise<void>;
}

export default function CreateWorkflowDialog({
  agent,
  updateAgent,
}: CreateWorkflowDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const closeDialog = () => {
    updateAgent();
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>
          <Plus />
          Workflow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[70%]">
        <DialogHeader>
          <DialogTitle>Create Workflow</DialogTitle>
          <DialogDescription>
            Let the agent apply to jobs while you upskill
          </DialogDescription>
        </DialogHeader>
        <CreateWorkflowForm agent={agent} closeDialog={closeDialog} />
      </DialogContent>
    </Dialog>
  );
}
