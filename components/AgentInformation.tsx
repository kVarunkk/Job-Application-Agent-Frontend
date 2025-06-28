"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { Label } from "./ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface AgentInformationProps {
  agent: Agent;
  updateSidebarAfterUpdation: () => Promise<void>;
}

export default function AgentInformation({
  agent,
  updateSidebarAfterUpdation,
}: AgentInformationProps) {
  const [filterUrl, setFilterUrl] = useState(agent.filter_url);
  const [loading, setLoading] = useState(false);

  const updateAgent = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("agents")
        .update({
          filter_url: filterUrl,
        })
        .eq("id", agent.id);
      if (error) throw error;
    } catch (error) {
      console.error("Some error occured while updating Agent");
    } finally {
      setLoading(false);
      updateSidebarAfterUpdation();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="hover:text-primary text-muted-foreground group-hover:block hidden">
          <MoreVertical className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{agent.name}</SheetTitle>
          <SheetDescription>
            You can only update your Job Posting URL for your current agent.
          </SheetDescription>
        </SheetHeader>

        {/* This wraps the editable form and pushes button to bottom */}
        <div className="flex flex-col flex-1 justify-between gap-6 mt-6">
          {/* Form */}
          <div className="flex flex-col gap-4">
            <Label htmlFor="filter_url" className="flex items-center gap-2">
              Job Posting URL
              <Tooltip>
                <TooltipTrigger className="cursor-default">
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Enter the URL of the job postings you want to filter. You
                    can find this URL on the{" "}
                    <a
                      href="https://www.workatastartup.com/companies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:underline"
                    >
                      WorkAtAStartup
                    </a>{" "}
                    website.
                  </p>
                </TooltipContent>
              </Tooltip>
            </Label>

            <Textarea
              value={filterUrl}
              onChange={(e) => setFilterUrl(e.target.value)}
              id="filter_url"
              name="filter_url"
              placeholder="e.g. https://www.workatastartup.com/companies?demographic=any&hasEquity=any&hasSalary=any&industry=any"
              required
            />
          </div>

          {/* Button at bottom */}
          <Button
            onClick={updateAgent}
            disabled={loading || filterUrl.trim().length === 0}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Agent"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
