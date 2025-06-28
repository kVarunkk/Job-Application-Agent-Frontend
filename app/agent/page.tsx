import AgentMain from "@/components/AgentMain";
import { createClient } from "@/lib/supabase/server";

export default async function AgentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return <AgentMain activeUser={user} />;
}
