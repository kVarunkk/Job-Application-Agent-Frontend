interface Agent {
  id: string;
  name: string;
  user_id: string;
  resume_url: string;
  filter_url: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "agent";
  created_at: string;
}
