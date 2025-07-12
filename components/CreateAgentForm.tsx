"use client";

import { useActionState, useEffect, useState } from "react";
import { createAgent } from "@/app/actions/create-agent";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import InfoTooltip from "./InfoTooltip";

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
  const [agentType, setAgentType] = useState<EAgentType>();
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
        <Label className="flex items-center gap-2" htmlFor="agentType">
          Agent Type
          <InfoTooltip
            content={
              <p>
                Select the Job Application Platform you want to engage with
                using the Agent.
              </p>
            }
          />
        </Label>
        <Select
          value={agentType}
          onValueChange={(value) => setAgentType(value as EAgentType)}
          name="agentType"
          required
        >
          <SelectTrigger id="agentType">
            <SelectValue placeholder="Y Combinator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ycombinator">Y Combinator</SelectItem>
            <SelectItem value="remoteok">Remote OK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {agentType && (
        <div className="flex flex-col gap-2">
          <FilterUrlField agentType={agentType} />
          <p className="text-sm text-red-500">
            {errors.filter_url && errors.filter_url}
          </p>
        </div>
      )}

      {agentType && agentType === "ycombinator" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="yc_username">YC Username</Label>
          <Input id="yc_username" name="yc_username" required />
          <p className="text-sm text-red-500">
            {errors.yc_username && errors.yc_username}
          </p>
        </div>
      )}

      {agentType && agentType === "ycombinator" && (
        <div className="flex flex-col gap-2">
          <Label className="flex items-center gap-2" htmlFor="yc_password">
            YC Password
            <InfoTooltip
              content={
                <p>
                  Stored safely with proper encryption. This will be used to
                  login to your YC account and fetch job postings/Apply to job
                  postings.
                </p>
              }
            />
          </Label>
          <Input id="yc_password" name="yc_password" type="password" required />
          <p className="text-sm text-red-500">
            {errors.yc_password && errors.yc_password}
          </p>
        </div>
      )}

      {agentType && (
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
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Agent"}
      </Button>
    </form>
  );
}

function FilterUrlField({ agentType }: { agentType: EAgentType }) {
  let variableContent;

  switch (agentType) {
    case "ycombinator":
      variableContent = {
        infoLinkHref: "https://www.workatastartup.com/companies",
        infoLinkText: "Work At A Startup",
        placeholder:
          "e.g. https://www.workatastartup.com/companies?demographic=any&hasEquity=any&hasSalary=any&industry=any",
      };
      break;
    case "remoteok":
      variableContent = {
        infoLinkHref: "https://remoteok.com",
        infoLinkText: "Remote OK",
        placeholder:
          "e.g. https://remoteok.com/remote-dev+engineer-jobs?location=Worldwide",
      };
      break;
    default:
      variableContent = {
        infoLinkHref: "",
        infoLinkText: "",
        placeholder: "",
      };
      break;
  }
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="filter_url" className="flex items-center gap-2">
        Job Posting URL
        <InfoTooltip
          content={
            <p>
              Enter the URL of the job postings page after you have selected the
              filters. You can find this URL on the{" "}
              <a
                href={variableContent.infoLinkHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline"
              >
                {variableContent.infoLinkText}
              </a>{" "}
              website.
            </p>
          }
        />
      </Label>

      <Textarea
        id="filter_url"
        name="filter_url"
        placeholder={variableContent.placeholder}
        required
      />
    </div>
  );
}
