"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { v4 as uuidv4 } from "uuid";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GenericFormData {
  [key: string]: string | number | string[]; // Added string[] for multi-select types
}

interface MultiKeywordSelectProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, keywords: string[]) => void;
  placeholder?: string;
  // Renamed from initialKeywords to initialKeywords to follow controlled component conventions
  initialKeywords?: string[];
  className?: string;
  label?: string; // Not used in this component, but keeping it as per your code
  availableItems?: string[];
}

export default function MultiKeywordSelect({
  name,
  onChange,
  placeholder,
  initialKeywords = [], // Default to empty array if not provided
  className = "",
  availableItems = [],
}: MultiKeywordSelectProps) {
  // Internal state for the dropdown initialKeywords to ensure it resets after selection
  const [selectedDropdownValue, setSelectedDropdownValue] =
    useState<string>("");

  // Memoize the transformation of the 'initialKeywords' prop into the {id, content} format for rendering.
  // This array is purely for display and derives directly from the 'initialKeywords' prop.
  const displayedKeywords = useMemo(() => {
    // We generate UUIDs here for the key prop in the map,
    // but the actual 'initialKeywords' (string array) passed to onChange remains clean.
    return initialKeywords.map((content) => ({ id: uuidv4(), content }));
  }, [initialKeywords]); // Recalculate only when the 'initialKeywords' prop changes

  // Callback to add a keyword
  const addKeyword = useCallback(
    (contentToAdd: string) => {
      const trimmed = contentToAdd.trim();
      // Ensure content is not empty and not already in the 'initialKeywords' array
      if (
        !trimmed ||
        initialKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())
      ) {
        return;
      }
      // Call the parent's onChange with the new array
      onChange(name, [...initialKeywords, trimmed]);
    },
    [name, onChange, initialKeywords] // Dependencies: name, onChange, and the current 'initialKeywords' prop
  );

  // Callback to handle selection from the dropdown
  const handleSelectChange = useCallback(
    (selectedContent: string) => {
      if (selectedContent) {
        addKeyword(selectedContent); // Use the existing addKeyword logic
        setSelectedDropdownValue(""); // Reset dropdown initialKeywords to clear selection
      }
    },
    [addKeyword] // Dependency: addKeyword
  );

  // Callback to remove a keyword
  const removeKeyword = useCallback(
    (contentToRemove: string) => {
      // Call the parent's onChange with the filtered array
      onChange(
        name,
        initialKeywords.filter((content) => content !== contentToRemove)
      );
    },
    [name, onChange, initialKeywords] // Dependencies: name, onChange, and the current 'initialKeywords' prop
  );

  // Filter available items to exclude those already added (based on the 'initialKeywords' prop)
  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter(
      (item) =>
        !initialKeywords.some((k) => k.toLowerCase() === item.toLowerCase())
    );
  }, [availableItems, initialKeywords]);

  return (
    <div className={cn("flex flex-col gap-2 relative", className)}>
      <div className="flex gap-2">
        <Select
          onValueChange={handleSelectChange}
          value={selectedDropdownValue} // Controlled initialKeywords for the select dropdown
        >
          <SelectTrigger className="bg-input">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="">
            {filteredAvailableItems.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Display the keywords derived from the 'initialKeywords' prop */}
      {displayedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayedKeywords.map(({ content, id }) => (
            <span
              key={id}
              className="flex items-center border border-border px-2 py-1 rounded text-sm"
            >
              {content}
              <button
                type="button" // Important for buttons inside forms
                onClick={() => removeKeyword(content)} // Pass content to remove
                className="p-1"
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
