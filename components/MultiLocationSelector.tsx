"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICountry } from "@/lib/types";

export interface GenericFormData {
  [key: string]: string | number | string[];
}

interface MultiLocationSelectorProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, locations: string[]) => void;
  initialLocations?: string[];
  className?: string;
}

export default function MultiLocationSelector({
  name,
  onChange,
  initialLocations = [],
  className = "",
}: MultiLocationSelectorProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [isRemote, setIsRemote] = useState<"yes" | "no" | "">("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      // 1. Check for cached data in localStorage
      const cachedData = localStorage.getItem("countryData");
      const now = new Date().getTime();

      if (cachedData) {
        const { data, expiry } = JSON.parse(cachedData);
        // 2. If cache is valid, use it
        if (now < expiry) {
          setCountries(data);
          setIsLoading(false);
          return;
        } else {
          // 3. Cache expired, clear it
          localStorage.removeItem("countryData");
        }
      }

      // 4. No valid cache, make the API call
      setIsLoading(true);
      try {
        const response = await fetch("/api/locations");
        const data = await response.json();
        setCountries(data.data);
        // 5. Store new data with a 1-day expiration
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

  // Fetch cities when a country is selected
  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find((c) => c.country === selectedCountry);
      if (countryData) {
        setCities(countryData.cities);
      }
    } else {
      setCities([]);
    }
  }, [selectedCountry, countries]);

  // Callback to handle country selection
  const handleCountryChange = useCallback((country: string) => {
    setSelectedCountry(country);
    setSelectedCity(""); // Reset city when country changes
  }, []);

  // Callback to handle city selection
  const handleCityChange = useCallback((city: string) => {
    setSelectedCity(city);
  }, []);

  // Callback to handle remote checkbox change
  const handleRemoteChange = useCallback((value: "yes" | "no") => {
    setIsRemote(value);
    // setSelectedCountry("");
    // setSelectedCity("");
  }, []);

  // Callback to add the current selection as a single location string
  const addCurrentSelection = useCallback(() => {
    const countryData = countries.find((c) => c.country === selectedCountry);
    let locationString = "";

    if (isRemote === "yes") {
      locationString = selectedCountry
        ? `Remote (${countryData?.iso2})`
        : "Remote";
    } else if (selectedCity && selectedCountry) {
      locationString = `${selectedCity} (${countryData?.iso2})`;
    } else if (selectedCountry) {
      locationString = selectedCountry;
    }

    if (locationString && !initialLocations.includes(locationString)) {
      // Call the parent's onChange to update the state
      onChange(name, [...initialLocations, locationString]);
      setSelectedCountry("");
      setSelectedCity("");
      setIsRemote("");
    }
  }, [
    initialLocations,
    name,
    onChange,
    isRemote,
    selectedCountry,
    selectedCity,
    countries,
  ]);

  // Callback to remove a keyword
  const removeLocation = useCallback(
    (locationToRemove: string) => {
      // Call the parent's onChange with the filtered array
      onChange(
        name,
        initialLocations.filter((content) => content !== locationToRemove)
      );
    },
    [name, onChange, initialLocations]
  );

  const isSelectionValid = useMemo(() => {
    return isRemote || !!selectedCountry;
  }, [isRemote, selectedCountry]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          {/* Country Dropdown */}
          <div className="relative flex-1">
            <Select
              onValueChange={handleCountryChange}
              value={selectedCountry}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input ">
                <SelectValue
                  placeholder={
                    isLoading ? "Loading countries..." : "Select Country"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {countries.map((countryData) => (
                  <SelectItem
                    key={countryData.country}
                    value={countryData.country}
                  >
                    {countryData.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Dropdown - Conditionally rendered */}
          {selectedCountry && (
            <div className="relative flex-1">
              <Select
                onValueChange={handleCityChange}
                value={selectedCity}
                disabled={cities.length === 0}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue
                    placeholder={
                      cities.length > 0 ? "Select City" : "No cities available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="relative flex-1">
            <Select onValueChange={handleRemoteChange} value={isRemote}>
              <SelectTrigger className="bg-input ">
                <SelectValue placeholder={"Is Job Remote?"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(isRemote || selectedCountry) && (
            <div className="flex items-center text-muted-foreground ">
              <button
                type="button"
                className="p-1 hover:text-primary"
                disabled={!isSelectionValid}
                onClick={() => {
                  setIsRemote("");
                  setSelectedCity("");
                  setSelectedCountry("");
                }}
              >
                <X className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-1 hover:text-primary"
                onClick={addCurrentSelection}
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Display selected locations */}
      {initialLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {initialLocations.map((content) => (
            <span
              key={content}
              className="flex items-center border border-border px-2 py-1 rounded text-sm"
            >
              {content}
              <button
                type="button"
                onClick={() => removeLocation(content)}
                className="p-1 ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
