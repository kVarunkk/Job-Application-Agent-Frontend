"use client";

import { useCallback, useState } from "react";
import CreateAgentForm from "./CreateAgentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface CreateAgentDialogProps {
  triggerBtn: React.ReactNode;
}

export default function CreateAgentDialog({
  triggerBtn,
}: CreateAgentDialogProps) {
  const [openDialog, setOpenDialog] = useState(false);
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>{triggerBtn}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new agent.
          </DialogDescription>
        </DialogHeader>
        <CreateAgentForm
          closeDialog={useCallback(() => setOpenDialog(false), [])}
        />
      </DialogContent>
    </Dialog>
  );
}
