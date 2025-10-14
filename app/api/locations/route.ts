import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("countries_and_cities")
      .select("country, cities, iso");

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("Data not available");
    }

    return NextResponse.json({ data: data || [] });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : String(err) || "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
