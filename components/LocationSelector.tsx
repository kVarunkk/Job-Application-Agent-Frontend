"use client";

import { useEffect, useState } from "react";
import VirtualizedSelect from "./VirtualizedSelect";

interface CountryData {
  country: string;
  cities: string[];
}

interface LocationSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    if (value) {
      const parts = value.split(", ");
      if (parts.length === 2) {
        setSelectedCity(parts[0]);
        setSelectedCountry(parts[1]);
      }
    }
  }, [value]);

  useEffect(() => {
    const fetchCountries = async () => {
      const cachedData = localStorage.getItem("countryData");
      const now = Date.now();

      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        if (now < expiry) {
          setCountries(data);
          setIsLoading(false);
          return;
        } else {
          localStorage.removeItem("countryData");
        }
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/locations");
        const data = await response.json();
        setCountries(data.data);

        const oneDay = 24 * 60 * 60 * 1000;
        localStorage.setItem(
          "countryData",
          JSON.stringify({ data: data.data, expiry: now + oneDay })
        );
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find((c) => c.country === selectedCountry);
      setCities(countryData?.cities || []);
    } else {
      setCities([]);
    }
  }, [selectedCountry, countries]);

  useEffect(() => {
    if (selectedCity && selectedCountry) {
      onChange(`${selectedCity}, ${selectedCountry}`);
    } else {
      onChange("");
    }
  }, [selectedCity, selectedCountry, onChange]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity("");
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  return (
    <div className="flex gap-4">
      <div className="relative flex-1">
        <VirtualizedSelect
          items={countries?.map((each) => each.country) ?? []}
          selectedItem={selectedCountry}
          handleItemChange={(value) => handleCountryChange(value)}
          isLoading={isLoading}
          placeholder="Select Country"
        />
      </div>

      {/* City Selector */}
      <div className="relative flex-1">
        <VirtualizedSelect
          items={cities}
          selectedItem={selectedCity}
          handleItemChange={(value) => handleCityChange(value)}
          isLoading={false}
          placeholder="Select City"
        />
      </div>
    </div>
  );
}
