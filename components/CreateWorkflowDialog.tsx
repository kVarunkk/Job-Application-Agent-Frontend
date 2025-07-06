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

export default function CreateWorkflowDialog() {
  return (
    <Dialog>
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
        <CreateWorkflowForm />
      </DialogContent>
    </Dialog>
  );
}
