"use client";

import { useState, useCallback, useMemo, CSSProperties } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { v4 as uuidv4 } from "uuid";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Input } from "./ui/input";

export interface GenericFormData {
  [key: string]: string | number | string[];
}

interface MultiKeywordSelectProps {
  name: keyof GenericFormData;
  onChange: (name: keyof GenericFormData, keywords: string[]) => void;
  placeholder?: string;
  initialKeywords?: string[];
  className?: string;
  label?: string;
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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const displayedKeywords = useMemo(() => {
    return initialKeywords.map((content) => ({ id: uuidv4(), content }));
  }, [initialKeywords]);

  const filteredAvailableItems = useMemo(() => {
    return availableItems
      .filter(
        (item) =>
          !initialKeywords.some((k) => k.toLowerCase() === item.toLowerCase())
      )
      .filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [availableItems, initialKeywords, searchTerm]);

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
      setSearchTerm("");
    },
    [name, onChange, initialKeywords]
  );

  const handleSelectChange = useCallback(
    (selectedContent: string) => {
      if (selectedContent) {
        addKeyword(selectedContent);
        setSelectedDropdownValue("");
      }
    },
    [addKeyword]
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

  const VirtualizedItem = ({
    children,
    onClick,
  }: {
    children: React.ReactElement;
    onClick: () => void;
  }) => {
    return (
      <div
        onClick={onClick}
        className="relative flex cursor-pointer hover:bg-muted select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
      >
        {children}
      </div>
    );
  };

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const itemData = filteredAvailableItems[index];
    return (
      <div style={style}>
        <VirtualizedItem onClick={() => addKeyword(itemData)}>
          <div className="whitespace-normal">{itemData}</div>
        </VirtualizedItem>
      </div>
    );
  };

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
          <SelectContent
            className="max-h-[300px]"
            onPointerDown={(e) => e.stopPropagation()}
          >
            {isVirtualized && (
              <div className=" pl-1 flex items-center gap-1 sticky top-0 bg-background z-10 border-b">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="text-sm border-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // onClick={(e) => {
                  //   e.stopPropagation();
                  //   e.preventDefault();
                  // }}
                />
              </div>
            )}
            {isVirtualized && filteredAvailableItems.length > 0 && (
              <div className="h-60 w-full">
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      itemCount={filteredAvailableItems.length}
                      itemSize={45}
                      width={width}
                    >
                      {Row}
                    </List>
                  )}
                </AutoSizer>
              </div>
            )}
            {!isVirtualized &&
              filteredAvailableItems.length > 0 &&
              filteredAvailableItems.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            {filteredAvailableItems.length === 0 && (
              <div className="text-sm p-2 text-center">No items available</div>
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
                type="button"
                onClick={() => removeKeyword(content)}
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
