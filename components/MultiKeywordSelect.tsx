"use client";

import { useEffect, useState, useRef } from "react";
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
  [key: string]: string | number;
}

interface MultiKeywordSelectProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, keywords: string[]) => void;
  placeholder?: string;
  initialKeywords?: string[];
  className?: string;
  label?: string;
  availableItems?: string[];
}

export default function MultiKeywordSelect({
  name,
  onChange,
  placeholder,
  initialKeywords = [],
  className = "",
  availableItems = [],
}: MultiKeywordSelectProps) {
  const [keywords, setKeywords] = useState<
    {
      id: string;
      content: string;
    }[]
  >(initialKeywords?.map((content) => ({ id: uuidv4(), content })) ?? []);

  const [selectedDropdownValue, setSelectedDropdownValue] =
    useState<string>("");
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const isInitialized = useRef(false);

  useEffect(() => {
    onChangeRef.current(
      name,
      keywords.map((k) => k.content)
    );
  }, [keywords, name]);

  useEffect(() => {
    // Only run this effect once, or when initialKeywords *truly* changes
    // and the component hasn't already processed them.
    if (
      !isInitialized.current ||
      JSON.stringify(initialKeywords) !==
        JSON.stringify(keywords.map((k) => k.content))
    ) {
      setKeywords(
        initialKeywords.map((content) => ({ id: uuidv4(), content }))
      );
      isInitialized.current = true; // Mark as initialized
    }
  }, [initialKeywords]);

  const addKeyword = (contentToAdd: string) => {
    const trimmed = contentToAdd.trim();
    if (
      !trimmed ||
      keywords.some((k) => k.content.toLowerCase() === trimmed.toLowerCase())
    ) {
      return; // Do not add if empty or duplicate
    }
    setKeywords((prev) => [
      ...prev,
      {
        id: uuidv4(),
        content: trimmed,
      },
    ]);
  };

  const handleSelectChange = (value: string) => {
    if (value) {
      // Ensure a valid item was selected
      addKeyword(value);
      setSelectedDropdownValue(""); // Reset select to placeholder after selection
    }
  };

  const removeKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((_) => _.id !== id));
  };

  // Filter available items to exclude those already added as keywords
  const filteredAvailableItems = availableItems.filter(
    (item) =>
      !keywords.some((k) => k.content.toLowerCase() === item.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col gap-2 relative", className)}>
      <div className="flex gap-2">
        {
          <Select
            onValueChange={handleSelectChange}
            value={selectedDropdownValue}
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
        }
      </div>

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map(({ content, id }) => (
            <span
              key={id}
              className="flex items-center border border-border  px-2 py-1 rounded text-sm"
            >
              {content}
              <button onClick={() => removeKeyword(id)} className="p-1">
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
