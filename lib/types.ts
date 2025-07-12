interface Agent {
  id: string;
  name: string;
  user_id: string;
  resume_url: string;
  filter_url?: string;
  messages?: Message[];
  created_at: string;
  updated_at: string;
  workflows: IWorkflow[];
  type: EAgentType;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "agent";
  created_at: string;
}

interface IWorkflow {
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

interface IWorkflowRun {
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

interface IJobResult {
  score?: number;
  suitable?: boolean;
  description?: string;
  cover_letter?: string;
  applied?: boolean;
}

enum EAgentType {
  ycombinator = "ycombinator",
  remoteok = "remoteok",
}
