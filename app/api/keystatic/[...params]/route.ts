import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../keystatic.config";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const keystaticRouteHandler = makeRouteHandler({ config });

export const GET = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorizedEmail = "varunkumawatleap2@gmail.com";

  if (!user || user.email !== authorizedEmail) {
    return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // If authorized, delegate the request to the Keystatic handler
  return keystaticRouteHandler.GET(request);
};

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authorizedEmail = "varunkumawatleap2@gmail.com";

  if (!user || user.email !== authorizedEmail) {
    return new NextResponse(null, { status: 403, statusText: "Forbidden" });
  }

  // If authorized, delegate the request to the Keystatic handler
  return keystaticRouteHandler.POST(request);
};
