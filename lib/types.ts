import { agentConfigs } from "./agentSchemas";

export interface Agent {
  id: string;
  name: string;
  user_id: string;
  resume_url: string;
  filter_url?: string;
  messages?: Message[];
  created_at: string;
  updated_at: string;
  workflows: IWorkflow[];
  type: TAgentType;
  platforms?: IPlatform;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "agent";
  created_at: string;
}

export interface IWorkflow {
  id: string;
  created_at: string;
  updated_at: string;
  no_jobs: number;
  required_keywords: string[];
  excluded_keywords: string[];
  job_title_contains: string[];
  interval: string;
  auto_apply: boolean;
  user_id: string;
  agent_id: string;
  workflow_runs?: IWorkflowRun[];
  pause: boolean;
  last_run_at: string | null;
  running: boolean;
}

export interface IWorkflowRun {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  error: string | null;
  workflow_id: string;
  started_at: string;
  ended_at: string;
  suitable_jobs_scraped_or_applied_in_current_run: string[];
  job_results: Record<string, IJobResult>;
  auto_apply: boolean;
}

export interface IJobResult {
  score?: number;
  suitable?: boolean;
  description?: string;
  cover_letter?: string;
  applied?: boolean;
}

export interface IPlatform {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  auto_apply_available: boolean;
  fields: IPlatformField[];
}

export interface IPlatformField {
  id: string;
  name: string;
  type: "text" | "textarea" | "password";
  label: string;
  required: boolean;
  placeholder?: string;
  tooltip?: {
    text: string;
    linkText?: string;
    linkHref?: string;
  };
}

export type TAgentType = keyof typeof agentConfigs;
