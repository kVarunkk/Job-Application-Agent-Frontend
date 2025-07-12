"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import { createClient } from "@/lib/supabase/client";
import { IPlatform, TAgentType } from "@/lib/types";

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
  const [agentType, setAgentType] = useState<TAgentType>();
  const [errors, setErrors] = useState<IError>({
    name: "",
    filter_url: "",
    yc_username: "",
    yc_password: "",
  });
  const [platforms, setPlatforms] = useState<IPlatform[]>();
  const platformIdRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPlatforms = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("platforms").select("*");
      if (error) {
        console.error("Error fetching platforms:", error);
        return;
      }
      setPlatforms(data);
    };
    fetchPlatforms();
  }, []);

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
          onValueChange={(value) => {
            setAgentType(value as TAgentType);
            platformIdRef.current!.value =
              platforms?.find((platform) => platform.slug === value)?.id || "";
          }}
          name="agentType"
          required
        >
          <SelectTrigger id="agentType">
            <SelectValue placeholder="Y Combinator" />
          </SelectTrigger>
          <SelectContent>
            {platforms?.map((platform) => (
              <SelectItem key={platform.id} value={platform.slug}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <input hidden ref={platformIdRef} name="platformId" />

      {platforms && agentType && (
        <div className="flex flex-col gap-4 w-full">
          {platforms
            .filter((platform) => platform.slug === agentType)[0]
            .fields.map((field) => {
              if (field.type === "textarea") {
                return (
                  <div key={field.id} className="flex flex-col gap-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2"
                    >
                      {field.label}
                      {field.tooltip && (
                        <InfoTooltip
                          content={
                            <p>
                              {field.tooltip.text}{" "}
                              <a
                                href={field.tooltip.linkHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline"
                              >
                                {field.tooltip.linkText}
                              </a>
                            </p>
                          }
                        />
                      )}
                    </Label>
                    <Textarea
                      id={field.id}
                      name={field.name}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                    <p className="text-sm text-red-500">
                      {errors[field.name] && errors[field.name]}
                    </p>
                  </div>
                );
              } else if (field.type === "text" || field.type === "password") {
                return (
                  <div key={field.id} className="flex flex-col gap-2">
                    <Label
                      htmlFor={field.name}
                      className="flex items-center gap-2"
                    >
                      {field.label}
                      {field.tooltip && (
                        <InfoTooltip
                          content={
                            <p>
                              {field.tooltip.text}{" "}
                              <a
                                href={field.tooltip.linkHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 hover:underline"
                              >
                                {field.tooltip.linkText}
                              </a>
                            </p>
                          }
                        />
                      )}
                    </Label>
                    <Input
                      id={field.id}
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                    <p className="text-sm text-red-500">
                      {errors[field.name] && errors[field.name]}
                    </p>
                  </div>
                );
              }
            })}
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
