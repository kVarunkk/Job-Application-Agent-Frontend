import { NextResponse } from "next/server";

export async function GET() {
  try {
    // --- Perform both fetches in parallel using Promise.all() ---
    const [countriesWithCitiesResponse, isoResponse] = await Promise.all([
      fetch("https://countriesnow.space/api/v0.1/countries", {
        redirect: "follow",
      }),
      fetch("https://countriesnow.space/api/v0.1/countries/iso", {
        redirect: "follow",
      }),
    ]);

    if (!countriesWithCitiesResponse.ok) {
      throw new Error("Some error occurred while fetching locations");
    }

    if (!isoResponse.ok) {
      throw new Error(
        "Some error occurred while fetching ISO codes for locations"
      );
    }

    const countriesWithCities = await countriesWithCitiesResponse.json();
    const isoData = await isoResponse.json();

    // Create a map for quick lookup of ISO codes
    const isoMap = new Map();
    isoData.data.forEach((item: { name: string; Iso2: string }) => {
      isoMap.set(item.name, item.Iso2);
    });

    // Combine the data from both API calls
    const combinedData = countriesWithCities.data.map(
      (countryData: { country: string; cities: string[] }) => {
        const iso2 = isoMap.get(countryData.country) || null;
        return {
          country: countryData.country,
          cities: countryData.cities,
          iso2: iso2,
        };
      }
    );

    return NextResponse.json({ data: combinedData || [] });
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
