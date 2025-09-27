"use client";
import { User } from "@supabase/supabase-js";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { IBookmark } from "@/lib/types";

import JobsPageSheetItem from "./JobsPageSheetItem";
export default function JobsPageCommonSheet({ user }: { user: User | null }) {
  const [items, setItems] = useState<IBookmark[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("bookmarks")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      if (data) setItems(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchBookmarks();
  }, [user, fetchBookmarks]);

  return (
    <SheetContent className="!w-full sm:!max-w-2xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Bookmarks ({items && items.length})</SheetTitle>
        <SheetDescription>
          See and manage all your bookmarked job searchs in one place.
        </SheetDescription>
      </SheetHeader>
      <div className="mt-8 flex flex-col gap-4 ">
        {loading ? (
          <div className="text-center my-20 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground text-center my-20">
            No bookmarks yet.
          </div>
        ) : (
          items.map((item) => (
            <JobsPageSheetItem
              key={item.id}
              item={item}
              callbackFunc={fetchBookmarks}
            />
          ))
        )}
      </div>
    </SheetContent>
  );
}
