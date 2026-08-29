// e.g. app/api/debug/heapdump/route.js
import { writeHeapSnapshot } from "v8";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-debug-token") !== process.env.HEAPDUMP_TOKEN) {
    return new Response("Forbidden", { status: 403 });
  }

  const filename = `/tmp/heap-${Date.now()}.heapsnapshot`;
  writeHeapSnapshot(filename);

  const storage = new Storage();
  await storage.bucket(process.env.DEBUG_BUCKET || "").upload(filename);
  fs.unlinkSync(filename);

  return new Response("ok");
}
