"use client";

import { Trash } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface AgentDeleteDialogProps {
  agentId: string;
  updateSidebarAgentsAfterDeletion: (agentId: string) => void;
}

export default function AgentDeleteDialog({
  agentId,
  updateSidebarAgentsAfterDeletion,
}: AgentDeleteDialogProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const deleteAgent = async () => {
    try {
      setDeleteLoading(true);
      const response = await supabase.from("agents").delete().eq("id", agentId);
      if (response.error) throw response.error;
      await deleteRecordsFromCheckpointTable();
      updateSidebarAgentsAfterDeletion(agentId);
      if (pathname === "/agent/" + agentId) {
        router.push("/agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
    } finally {
      setDeleteLoading(false);
      setOpenDialog(false);
    }
  };

  const deleteRecordsFromCheckpointTable = async () => {
    try {
      const [response1, response2, response3] = await Promise.all([
        supabase.from("checkpoints").delete().eq("thread_id", agentId),
        supabase.from("checkpoint_writes").delete().eq("thread_id", agentId),
        supabase.from("checkpoint_blobs").delete().eq("thread_id", agentId),
        // supabase.from("workflows").delete().eq("agent_id", agentId),
      ]);

      if (
        response1.error ||
        response2.error ||
        response3.error
        // response4.error
      ) {
        throw new Error(
          `Failed to delete: ${response1.error?.message || ""} ${
            response2.error?.message || ""
          } ${response3.error?.message || ""} `
        );
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <DialogFooter>
      <Button
        disabled={deleteLoading}
        variant="destructive"
        onClick={() => {
          deleteAgent();
        }}
      >
        {deleteLoading ? "Deleting..." : "Delete Agent"}
      </Button>
      <Button disabled={deleteLoading} asChild variant="outline">
        <DialogClose disabled={deleteLoading}>Cancel</DialogClose>
      </Button>
    </DialogFooter>
  );
}
