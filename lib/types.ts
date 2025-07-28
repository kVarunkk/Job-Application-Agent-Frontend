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
  agents?: Agent;
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
  application_url?: string;
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

export interface IJob {
  id: string;
  job_name: string;
  company_name: string;
  company_url: string;
  job_type: string;
  salary_range: string;
  salary_min: number;
  salary_max: number;
  experience: string;
  experience_min: number;
  experience_max: number;
  equity_range: string;
  equity_min: number;
  equity_max: number;
  visa_requirement: string;
  description: string;
  job_url: string;
  created_at: string;
  updated_at: string;
  locations: string[];
  platform: string;
  user_favorites: {
    id: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    job_id: string;
  }[];
}

export interface IFormData {
  desired_roles: string[];
  preferred_locations: string[];
  min_salary: number | "";
  max_salary: number | "";
  experience_years: number | "";
  industry_preferences: string[];
  visa_sponsorship_required: boolean;
  top_skills: string[];
  work_style_preferences: string[];
  career_goals_short_term: string;
  career_goals_long_term: string;
  company_size_preference: string;
  resume_file: File | null;
  resume_url: string | null;
  resume_path: string | null;
  resume_name: string | null;
  default_locations: string[];
  job_type: string[];
}

export type TAgentType = keyof typeof agentConfigs;
