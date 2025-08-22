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
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

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
  isVirtualized?: boolean;
}

export default function MultiKeywordSelect({
  name,
  onChange,
  placeholder,
  initialKeywords = [],
  className = "",
  availableItems = [],
  isVirtualized = false,
}: MultiKeywordSelectProps) {
  const [selectedDropdownValue, setSelectedDropdownValue] =
    useState<string>("");

  const displayedKeywords = useMemo(() => {
    return initialKeywords.map((content) => ({ id: uuidv4(), content }));
  }, [initialKeywords]);

  const addKeyword = useCallback(
    (contentToAdd: string) => {
      const trimmed = contentToAdd.trim();
      if (
        !trimmed ||
        initialKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())
      ) {
        return;
      }
      onChange(name, [...initialKeywords, trimmed]);
    },
    [name, onChange, initialKeywords]
  );

  const handleSelectChange = useCallback(
    (selectedContent: string) => {
      if (selectedContent) {
        addKeyword(selectedContent); // Use the existing addKeyword logic
        setSelectedDropdownValue(""); // Reset dropdown initialKeywords to clear selection
      }
    },
    [addKeyword] // Dependency: addKeyword
  );

  const removeKeyword = useCallback(
    (contentToRemove: string) => {
      onChange(
        name,
        initialKeywords.filter((content) => content !== contentToRemove)
      );
    },
    [name, onChange, initialKeywords]
  );

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
          value={selectedDropdownValue}
        >
          <SelectTrigger className="bg-input">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="">
            {isVirtualized ? (
              <div className="h-60 w-full">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={filteredAvailableItems.length}
                      itemSize={45}
                      width={width}
                    >
                      {({ index, style }) => {
                        const itemData = filteredAvailableItems[index];
                        return (
                          <div style={style}>
                            <SelectItem key={itemData} value={itemData}>
                              {itemData}
                            </SelectItem>
                          </div>
                        );
                      }}
                    </List>
                  )}
                </AutoSizer>
              </div>
            ) : (
              filteredAvailableItems.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

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
