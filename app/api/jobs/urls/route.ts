// app/api/jobs/urls/route.ts
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function POST(req: Request) {
  const { job_ids }: { job_ids: string[] } = await req.json();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json([], { status: 401 });
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient.rpc("get_masked_job_urls", {
    p_job_ids: job_ids,
    p_user_id: user.id,
  });

  if (error || !data) {
    return Response.json([], { status: 200 });
  }

  return Response.json(data);
}
