import AgentMain from "@/components/AgentMain";
import Error from "@/components/Error";
import { createClient } from "@/lib/supabase/server";

export default async function AgentIdPage({
  params,
}: {
  params: Promise<{ agent_id: string }>;
}) {
  try {
    const { agent_id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: agentData, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", agent_id);

    if (agentError) {
      throw agentError;
    }
    if (!agentData || agentData.length === 0) {
      throw "Agent not found";
    }
    return <AgentMain agent={agentData[0]} activeUser={user} />;
  } catch (error) {
    return <Error />;
  }
}
