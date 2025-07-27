"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { v4 as uuidv4 } from "uuid";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenericFormData {
  [key: string]: string | number;
}

interface MultiKeywordSelectInputProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, keywords: string[]) => void;
  placeholder?: string;
  initialKeywords?: string[];
  className?: string;
  label?: string;
  availableItems?: string[];
}

export default function MultiKeywordSelectInput({
  name,
  onChange,
  placeholder,
  initialKeywords = [],
  className = "",
  availableItems = [],
}: MultiKeywordSelectInputProps) {
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<
    {
      id: string;
      content: string;
    }[]
  >(initialKeywords?.map((content) => ({ id: uuidv4(), content })) ?? []);

  const [selectedDropdownValue, setSelectedDropdownValue] =
    useState<string>("");
  const [isFocused, setIsFocused] = useState(false); // New state to track overall focus
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

  const handleInputAdd = () => {
    addKeyword(input);
    setInput(""); // Clear input field after adding
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault(); // Prevent form submission
      handleInputAdd();
    }
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

  // Focus handlers for the overall container
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <div className={cn("flex flex-col gap-2 relative", className)}>
      <div className="flex gap-2">
        <div
          id={`${name}-container`}
          className={cn(
            "flex items-center w-full  rounded-md",
            isFocused ? "ring-1 ring-primary" : "" // Apply ring based on isFocused state
            // Add error border if needed, but typically done on individual inputs
          )}
        >
          <Input
            id={String(name)}
            name={String(name)}
            placeholder={placeholder ?? "Type to add or select from dropdown"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="!rounded-r-none !border-0 bg-input !ring-0"
            onFocus={handleFocus} // Listen for focus entering the container
            onBlur={handleBlur}
          />
          {filteredAvailableItems.length > 0 && (
            <Select
              onOpenChange={(open) => {
                console.log(open);
                if (open) {
                  handleFocus();
                } else {
                  handleBlur();
                }
              }}
              onValueChange={handleSelectChange}
              value={selectedDropdownValue}
            >
              <SelectTrigger className="w-fit bg-input !rounded-l-none !border-none !ring-0">
                {/* <SelectValue placeholder="Or select from common options" /> */}
              </SelectTrigger>
              <SelectContent className="">
                {filteredAvailableItems.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {input.trim() && (
          <div className="flex items-center text-muted-foreground">
            <button
              onClick={() => setInput("")}
              className="p-1 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
            <button onClick={handleInputAdd} className="p-1 hover:text-primary">
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
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
