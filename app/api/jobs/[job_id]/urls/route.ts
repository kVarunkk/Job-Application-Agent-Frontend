// app/api/jobs/[job_id]/urls/route.ts

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ job_id: string }> },
) {
  const { job_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ job_url: null, company_url: null }, { status: 401 });
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient.rpc("get_masked_job_urls", {
    p_job_ids: [job_id],
    p_user_id: user.id,
  });

  if (error || !data || data.length === 0) {
    return Response.json({ job_url: null, company_url: null }, { status: 200 });
  }

  return Response.json(data[0]);
}
