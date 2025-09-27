"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import Link from "next/link";
import { Button } from "./ui/button";
import { Pencil, Trash } from "lucide-react";
import { IBookmark } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Link as ModifiedLink } from "react-transition-progress/next";
import { Input } from "./ui/input";
import AppLoader from "./AppLoader";

export default function JobsPageSheetItem({
  item,
  callbackFunc,
}: {
  item: IBookmark;
  callbackFunc: () => Promise<void>;
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogView, setDialogView] = useState<"edit" | "delete">("edit");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const updateItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const supabase = createClient();
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const url = formData.get("url") as string;
      const { error } = await supabase
        .from("bookmarks")
        .update({ name, url })
        .eq("id", item.id);
      if (error) throw error;
      setOpenDialog(false);
      callbackFunc();
      toast.success("Bookmark updated successfully");
    } catch {
      toast.error("Error updating bookmark");
    } finally {
      setFormLoading(false);
    }
  };

  const deleteItem = async () => {
    try {
      setDeleteLoading(true);
      const supabase = createClient();
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", item.id)
        .eq("user_id", item.user_id);
      if (error) throw error;
      callbackFunc();
      setOpenDialog(false);
      setDeleteLoading(false);
    } catch {
      toast.error("Some error occured, please try again later.");
    }
  };

  return (
    <div className="p-4 border rounded-md hover:bg-secondary flex items-center justify-between">
      <div className="flex flex-col gap-2 w-full max-w-[40%]">
        <div className="flex items-center gap-1">
          <Link
            href={item.url}
            className="text-lg font-medium truncate max-w-full flex-shrink-0"
          >
            {item.name}
          </Link>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <div className="flex items-center gap-2">
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setOpenDialog(true);
                    setDialogView("edit");
                  }}
                  variant={"ghost"}
                  size={"sm"}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setOpenDialog(true);
                    setDialogView("delete");
                  }}
                  variant="ghost"
                  size={"sm"}
                >
                  <Trash />
                </Button>
              </DialogTrigger>
            </div>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="max-w-[200px] truncate text-start">
                  {dialogView === "edit" ? "Edit" : "Delete"} `&quot;{item.name}
                  `&quot;
                </DialogTitle>
                {dialogView === "delete" && (
                  <DialogDescription className="text-start">
                    Are you sure you want to remove this item? This action
                    cannot be undone.
                  </DialogDescription>
                )}
              </DialogHeader>
              {dialogView === "edit" ? (
                <form className="flex flex-col gap-4" onSubmit={updateItem}>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-medium">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={item.name}
                      className="bg-input text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="url" className="font-medium">
                      URL
                    </label>
                    <Input
                      id="url"
                      name="url"
                      defaultValue={item.url}
                      className="bg-input text-sm"
                    />
                  </div>
                  <div className="flex justify-start gap-2 mt-4">
                    <DialogClose asChild>
                      <Button disabled={formLoading} variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={formLoading} type="submit">
                      Save
                      {formLoading && <AppLoader color="secondary" size="sm" />}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-start gap-2 mt-4">
                  <DialogClose asChild>
                    <Button disabled={deleteLoading} variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>

                  <Button
                    onClick={deleteItem}
                    disabled={formLoading}
                    type="button"
                    variant={"destructive"}
                  >
                    Delete
                    {deleteLoading && <AppLoader color="secondary" size="sm" />}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* 3. URL/Origin Paragraph */}
        <p className="text-muted-foreground truncate">
          {/* The text here will automatically truncate due to the parent's max-w-[80%] and the 'truncate' class */}
          {origin}
          {item.url}
        </p>
      </div>

      {/* Visit Button - Always fixed on the right */}
      <ModifiedLink
        href={item.url}
        className="shrink-0"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button>Visit</Button>
      </ModifiedLink>
    </div>
  );
}
