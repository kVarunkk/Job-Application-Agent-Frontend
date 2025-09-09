"use client";

import { useState, useCallback, useMemo, memo } from "react"; // Added memo, useCallback, useMemo
import { Input } from "./ui/input";
import { v4 as uuidv4 } from "uuid";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import MultiKeywordSelect from "./MultiKeywordSelect";

interface GenericFormData {
  [key: string]: string | number | string[]; // Ensures it can handle string arrays
}

interface MultiKeywordSelectInputProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, keywords: string[]) => void;
  placeholder?: string;
  // Renamed from initialKeywords to initialKeywords for standard controlled component pattern
  initialKeywords?: string[];
  className?: string;
  label?: string; // Not used in this component, but keeping it as per your code
  availableItems?: string[];
}

// Wrap the component in React.memo for performance optimization
export default memo(function MultiKeywordSelectInput({
  name,
  onChange,
  placeholder,
  initialKeywords = [], // Default to empty array if not provided by parent
  className = "",
  availableItems = [],
}: MultiKeywordSelectInputProps) {
  // State for the text input field initialKeywords (what the user types)
  const [input, setInput] = useState("");

  // State to track if the component or its children are focused, for styling purposes
  const [isFocused, setIsFocused] = useState(false);

  // Memoize the transformation of the 'initialKeywords' prop (string[]) into the {id, content}
  // format required for rendering the displayed keyword tags.
  // This array is purely for display and is derived directly from the 'initialKeywords' prop.
  const displayedKeywords = useMemo(() => {
    // We generate UUIDs here for the React 'key' prop in the map,
    // but the actual 'initialKeywords' (string array) passed to onChange remains clean.
    return initialKeywords.map((content) => ({ id: uuidv4(), content }));
  }, [initialKeywords]); // Recalculate only when the 'initialKeywords' prop from the parent changes

  // Callback to add a new keyword (from input or select dropdown)
  const addKeyword = useCallback(
    (contentToAdd: string) => {
      const trimmed = contentToAdd.trim();
      // Only add if content is not empty and not already present (case-insensitive)
      if (
        !trimmed ||
        initialKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())
      ) {
        return;
      }
      // Notify the parent component of the new array of keywords
      // We create a new array here to ensure immutability and trigger parent re-render
      onChange(name, [...initialKeywords, trimmed]);
    },
    [name, onChange, initialKeywords] // Dependencies: `name`, `onChange` (stable via useCallback in parent), and current `initialKeywords` prop
  );

  // Handler for adding keyword from the text input field
  const handleInputAdd = useCallback(() => {
    addKeyword(input); // Use the shared addKeyword logic
    setInput(""); // Clear the text input field after adding
  }, [addKeyword, input]); // Dependencies: `addKeyword` (stable via useCallback) and current `input` state

  // Handler for Enter key press in the text input field
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && input.trim()) {
        e.preventDefault(); // Prevent default form submission
        handleInputAdd();
      }
    },
    [input, handleInputAdd] // Dependencies: `input` and `handleInputAdd` (stable via useCallback)
  );

  // Callback to remove an existing keyword
  const removeKeyword = useCallback(
    (contentToRemove: string) => {
      // Notify the parent component of the new filtered array of keywords
      // Filter based on the current 'initialKeywords' prop from the parent
      onChange(
        name,
        initialKeywords.filter((content) => content !== contentToRemove)
      );
    },
    [name, onChange, initialKeywords] // Dependencies: `name`, `onChange`, and current `initialKeywords` prop
  );

  // Filter available items for the dropdown to exclude those already selected,
  // memoized for efficiency.
  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter((item) =>
      item.toLowerCase().includes(input.toLowerCase())
    );
  }, [availableItems]); // Dependencies: `availableItems` (prop) and current `initialKeywords` prop

  // Focus handlers for the overall container, memoized
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  return (
    <div className={cn("flex flex-col gap-2 relative", className)}>
      <div className="flex gap-2">
        <div
          id={`${name}-container`}
          className={cn(
            "flex items-center w-full rounded-md",
            isFocused ? "ring-1 ring-primary" : ""
          )}
        >
          <Input
            id={String(name)}
            name={String(name)}
            placeholder={placeholder ?? "Type to add or select from dropdown"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="!rounded-r-none !border-0 bg-input !ring-0 text-sm"
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          {filteredAvailableItems.length > 0 && (
            // <Select
            //   onOpenChange={(open) => {
            //     // When the select dropdown opens/closes, update the focus state
            //     if (open) {
            //       handleFocus();
            //     } else {
            //       handleBlur();
            //     }
            //   }}
            //   onValueChange={handleSelectChange}
            //   value={selectedDropdownValue}
            // >
            //   <SelectTrigger className="w-fit bg-input !rounded-l-none !border-none !ring-0">
            //     {/* Placeholder for the select trigger, can be empty or a subtle hint */}
            //     <SelectValue placeholder=" " />
            //   </SelectTrigger>
            //   <SelectContent className="">
            //     {filteredAvailableItems.map((item) => (
            //       <SelectItem key={item} value={item}>
            //         {item}
            //       </SelectItem>
            //     ))}
            //   </SelectContent>
            // </Select>
            <MultiKeywordSelect
              name={name}
              placeholder={""}
              initialKeywords={displayedKeywords.map((each) => each.content)}
              onChange={onChange}
              className=" w-fit"
              availableItems={filteredAvailableItems}
              isVirtualized={true}
              showKeywords={false}
            />
          )}
        </div>
        {input.trim() && ( // Show add/clear buttons only if input has content
          <div className="flex items-center text-muted-foreground">
            <button
              type="button" // Important to prevent form submission
              onClick={() => setInput("")}
              className="p-1 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              type="button" // Important to prevent form submission
              onClick={handleInputAdd}
              className="p-1 hover:text-primary"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {displayedKeywords.length > 0 && ( // Use displayedKeywords for rendering
        <div className="flex flex-wrap gap-2">
          {displayedKeywords.map(({ content, id }) => (
            <span
              key={id}
              className="flex items-center border border-border px-2 py-1 rounded text-sm"
            >
              {content}
              <button
                type="button" // Important to prevent form submission
                onClick={() => removeKeyword(content)} // Pass content for removal logic
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
});
