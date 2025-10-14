import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_COMPANY_EMBEDDING_URL;
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!FASTAPI_URL || !SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variables for API call.");
}

export async function POST(request: Request) {
  try {
    const userData = await request.json();

    if (!userData || !userData.user_id) {
      return NextResponse.json(
        { error: "User data or user_id is missing." },
        { status: 400 }
      );
    }

    const response = await fetch(FASTAPI_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("FastAPI embedding error:", errorData);
      return NextResponse.json(
        { error: "Failed to create embedding." },
        { status: response.status }
      );
    }

    const result = await response.json();
    const newEmbedding = result.embedding; // Get the embedding from the FastAPI response

    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("company_info")
      .update({ embedding: newEmbedding })
      .eq("user_id", userData.user_id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update user embedding in Supabase." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Embedding successfully created and updated.",
      data: result,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
