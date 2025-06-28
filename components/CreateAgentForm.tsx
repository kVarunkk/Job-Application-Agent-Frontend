"use client";

import { useActionState, useEffect, useState } from "react";
import { createAgent } from "@/app/actions/create-agent";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface CreateAgentFormProps {
  closeDialog: () => void;
}

interface IError {
  name?: string;
  filter_url?: string;
  yc_password?: string;
  yc_username?: string;
  [key: string]: string | undefined;
}

export default function CreateAgentForm({ closeDialog }: CreateAgentFormProps) {
  const [formState, formAction, isPending] = useActionState(createAgent, {
    success: false,
    error: null,
  });
  const [errors, setErrors] = useState<IError>({
    name: "",
    filter_url: "",
    yc_username: "",
    yc_password: "",
  });

  const router = useRouter();

  useEffect(() => {
    if (formState.error) {
      const errorsObj: IError = {};
      JSON.parse(formState.error).forEach(
        (each: { path: string[]; message: string }) => {
          errorsObj[each.path[0]] = each.message;
        }
      );
      setErrors(errorsObj);
    }

    if (formState.agentId) {
      closeDialog();
      router.push(`/agent/${formState.agentId}`);
    }
  }, [formState]);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Agent Name</Label>
        <Input id="name" name="name" placeholder="e.g. YC Agent" required />
        <p className="text-sm text-red-500">{errors.name && errors.name}</p>
      </div>

      <div className="flex flex-col gap-2">
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
          id="filter_url"
          name="filter_url"
          placeholder="e.g. https://www.workatastartup.com/companies?demographic=any&hasEquity=any&hasSalary=any&industry=any"
          required
        />

        <p className="text-sm text-red-500">
          {errors.filter_url && errors.filter_url}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="yc_username">YC Username</Label>
        <Input id="yc_username" name="yc_username" required />
        <p className="text-sm text-red-500">
          {errors.yc_username && errors.yc_username}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="flex items-center gap-2" htmlFor="yc_password">
          YC Password
          <Tooltip>
            <TooltipTrigger className="cursor-default">
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Stored safely with proper encryption. This will be used to login
                to your YC account and fetch job postings/Apply to job postings.
              </p>
            </TooltipContent>
          </Tooltip>
        </Label>
        <Input id="yc_password" name="yc_password" type="password" required />
        <p className="text-sm text-red-500">
          {errors.yc_password && errors.yc_password}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="resume">Upload Resume (PDF)</Label>
        <Input
          id="resume"
          name="resume"
          type="file"
          accept="application/pdf"
          required
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  );
}
