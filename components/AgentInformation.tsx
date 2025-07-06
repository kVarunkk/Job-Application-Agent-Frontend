"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
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
    <div className="flex flex-col gap-6">
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
                Enter the URL of the job postings you want to filter. You can
                find this URL on the{" "}
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

      <DialogFooter>
        <Button
          onClick={updateAgent}
          disabled={loading || filterUrl.trim().length === 0}
        >
          {loading ? "Updating..." : "Update Agent"}
        </Button>
      </DialogFooter>
    </div>
  );
}
