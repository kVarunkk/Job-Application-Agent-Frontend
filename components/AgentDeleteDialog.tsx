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

  const deleteAgent = async () => {
    try {
      setDeleteLoading(true);
      const supabase = createClient();
      const response = await supabase.from("agents").delete().eq("id", agentId);
      if (response.error) throw response.error;
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

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="hover:text-primary text-muted-foreground group-hover:block hidden"
        >
          <Trash className="h-4 w-4 " />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Agent</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this agent? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
}
