"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AgentInformation from "./AgentInformation";
import AgentDeleteDialog from "./AgentDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetTrigger } from "./ui/sheet";

interface AgentSidebarBtnProps {
  agent: Agent;
  updateSidebarAfterUpdation: () => Promise<void>;
  updateSidebarAgentsAfterDeletion: (agentId: string) => void;
}

export default function AgentSidebarBtn({
  agent,
  updateSidebarAfterUpdation,
  updateSidebarAgentsAfterDeletion,
}: AgentSidebarBtnProps) {
  const pathname = usePathname();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"edit" | "delete" | null>(null);

  return (
    <div
      className={cn(
        "flex items-center justify-between group rounded-md hover:bg-muted transition",
        pathname === "/agent/" + agent.id
          ? "bg-muted font-semibold"
          : "text-muted-foreground"
      )}
    >
      <Link href={"/agent/" + agent.id} className={cn("p-2 flex-1 truncate")}>
        {agent.name}
      </Link>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="">
            <Button className="p-2" variant={"ghost"}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DialogTrigger onClick={() => setDialogType("edit")} asChild>
              <DropdownMenuItem className="cursor-pointer">
                <Pencil />
                Edit
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogTrigger onClick={() => setDialogType("delete")} asChild>
              <DropdownMenuItem className="cursor-pointer">
                <Trash />
                Delete
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "edit" ? "Update Agent" : "Delete Agent"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "edit"
                ? "You can only update your Job Posting URL for your current agent."
                : "Are you sure you want to delete this agent? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          {dialogType === "edit" ? (
            <AgentInformation
              agent={agent}
              updateSidebarAfterUpdation={updateSidebarAfterUpdation}
            />
          ) : (
            <AgentDeleteDialog
              agentId={agent.id}
              updateSidebarAgentsAfterDeletion={
                updateSidebarAgentsAfterDeletion
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
