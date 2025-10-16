"use client";

import { useEffect, useState } from "react";

export function useCachedFetch<T>(
  key: string,
  url: string,
  ttlMs: number = 24 * 60 * 60 * 1000,
  isFilterComponent: boolean = false
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const cached = localStorage.getItem(key);
      const now = Date.now();

      if (cached) {
        try {
          const { data, expiry } = JSON.parse(cached);
          if (now < expiry) {
            if (isFilterComponent) {
              const manipulatedData = manipulateLocations(data);
              setData(manipulatedData);
              setIsLoading(false);
              return;
            }
            setData(data);
            setIsLoading(false);
            return;
          }
        } catch {
          // corrupted cache — ignore
        }
        localStorage.removeItem(key);
      }

      try {
        setIsLoading(true);
        const res = await fetch(url);
        const json = await res.json();
        if (isFilterComponent) {
          const manipulatedData = manipulateLocations(json.data || json);
          setData(manipulatedData);
        } else setData(json.data || json);

        localStorage.setItem(
          key,
          JSON.stringify({ data: json.data || json, expiry: now + ttlMs })
        );
      } catch {
        // console.error(`Failed to fetch ${url}`, e);
      } finally {
        setIsLoading(false);
      }
    };

    const manipulateLocations = (data: T) => {
      if (!isFilterComponent) return data;

      const locationSet = new Set<string>();

      locationSet.add("Remote");

      if (Array.isArray(data)) {
        data.forEach((countryData: { country: string; cities: string[] }) => {
          locationSet.add(countryData.country);

          countryData.cities.forEach((city: string) => {
            locationSet.add(city);
          });
        });
      }

      const locations = Array.from(locationSet).map((loc) => ({
        location: loc,
      }));
      return locations as unknown as T;
    };

    fetchData();
  }, [key, url, ttlMs]);

  return { data, isLoading };
}
