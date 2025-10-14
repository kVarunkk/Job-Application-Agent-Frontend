import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const [locationsResult, companiesResult] = await Promise.all([
      supabase.from("countries_and_cities").select("country, cities"),
      supabase.rpc("get_unique_companies"),
    ]);

    if (locationsResult.error) {
      throw locationsResult.error;
    }
    if (companiesResult.error) {
      throw companiesResult.error;
    }

    const locationSet = new Set<string>();

    locationSet.add("Remote");

    locationsResult.data.forEach(
      (countryData: { country: string; cities: string[] }) => {
        locationSet.add(countryData.country);

        countryData.cities.forEach((city: string) => {
          locationSet.add(city);
        });
      }
    );

    const locations = Array.from(locationSet).map((loc) => ({
      location: loc,
    }));

    const companies = companiesResult.data || [];

    return NextResponse.json({ locations, companies }, { status: 200 });
  } catch {
    // console.error("Error fetching filters:", e);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
