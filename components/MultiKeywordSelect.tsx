"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  CSSProperties,
  ReactElement,
  useRef,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariableSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Badge } from "./ui/badge";

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
  showKeywords?: boolean;
}

export default function MultiKeywordSelect({
  name,
  onChange,
  placeholder = "Select items...",
  initialKeywords = [],
  className = "",
  availableItems = [],
  isVirtualized = false,
  showKeywords = true,
}: MultiKeywordSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const displayedKeywords = useMemo(() => {
    return initialKeywords.map((content) => ({ id: uuidv4(), content }));
  }, [initialKeywords]);

  const filteredAvailableItems = useMemo(() => {
    return availableItems.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableItems, searchTerm]);

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

  const removeKeyword = useCallback(
    (contentToRemove: string) => {
      onChange(
        name,
        initialKeywords.filter((content) => content !== contentToRemove)
      );
    },
    [name, onChange, initialKeywords]
  );

  return (
    <div className={cn("flex flex-col gap-2 ", className)}>
      {isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            {name === "profile" ? (
              <Button
                role="combobox"
                aria-expanded={open}
                className="rounded-full bg-primary shadow-lg relative"
              >
                <Badge className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white">
                  {initialKeywords.length}
                </Badge>
                <User />
                <span className="truncate">{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />{" "}
              </Button>
            ) : (
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between bg-input text-muted-foreground",
                  !showKeywords && "rounded-l-none shadow-none"
                )}
              >
                <span className="truncate">{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          </PopoverTrigger>
          {name === "profile" ? (
            <PopoverContent
              className="p-0 relative"
              style={{ pointerEvents: "auto" }}
            >
              <div
                className="max-h-[300px] overflow-y-auto"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 50%, transparent 100%)",
                }}
              >
                <ItemsList
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isVirtualized={isVirtualized}
                  filteredAvailableItems={filteredAvailableItems}
                  Row={Row}
                  initialKeywords={initialKeywords}
                  addKeyword={addKeyword}
                  removeKeyword={removeKeyword}
                  name={name}
                />
              </div>
            </PopoverContent>
          ) : (
            <PopoverContent className="p-0 " style={{ pointerEvents: "auto" }}>
              <ItemsList
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isVirtualized={isVirtualized}
                filteredAvailableItems={filteredAvailableItems}
                Row={Row}
                initialKeywords={initialKeywords}
                addKeyword={addKeyword}
                removeKeyword={removeKeyword}
                name={name}
              />
            </PopoverContent>
          )}
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            {name === "profile" ? (
              <Button
                role="combobox"
                aria-expanded={open}
                className="rounded-full bg-primary shadow-lg"
              >
                <span className="truncate">{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            ) : (
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between bg-input text-muted-foreground",
                  !showKeywords && "rounded-l-none shadow-none"
                )}
              >
                <span className="truncate">{placeholder}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          </DrawerTrigger>
          {name !== "profile" ? (
            <DrawerContent className="p-0 ">
              <DrawerHeader>
                <DrawerTitle></DrawerTitle>
                <DrawerDescription>
                  {initialKeywords.length} items selected
                </DrawerDescription>
              </DrawerHeader>
              <div className=" border-t">
                <ItemsList
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isVirtualized={isVirtualized}
                  filteredAvailableItems={filteredAvailableItems}
                  Row={Row}
                  initialKeywords={initialKeywords}
                  addKeyword={addKeyword}
                  removeKeyword={removeKeyword}
                  name={name}
                />
              </div>
            </DrawerContent>
          ) : (
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle></DrawerTitle>
                <DrawerDescription>
                  {initialKeywords.length} items selected
                </DrawerDescription>
              </DrawerHeader>
              <div className=" border-t">
                <ItemsList
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  isVirtualized={isVirtualized}
                  filteredAvailableItems={filteredAvailableItems}
                  Row={Row}
                  initialKeywords={initialKeywords}
                  addKeyword={addKeyword}
                  removeKeyword={removeKeyword}
                  name={name}
                />
              </div>
            </DrawerContent>
          )}
        </Drawer>
      )}

      {displayedKeywords.length > 0 && showKeywords && (
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

const Row = React.memo(
  ({
    index,
    style,
    data,
    name,
  }: {
    index: number;
    style: CSSProperties;
    data: {
      filteredAvailableItems: string[];
      initialKeywords: string[];
      addKeyword: (keyword: string) => void;
      removeKeyword: (keyword: string) => void;
      onResize: (index: number, size: number) => void;
    };
    name: keyof GenericFormData;
  }): ReactElement => {
    Row.displayName = "Row";
    const {
      filteredAvailableItems,
      initialKeywords,
      addKeyword,
      removeKeyword,
      onResize,
    } = data;
    const itemData = filteredAvailableItems[index];
    const rowRef = useRef<HTMLDivElement>(null);

    const checked = initialKeywords.includes(itemData);

    useEffect(() => {
      if (rowRef.current) {
        const height = rowRef.current.scrollHeight;
        onResize(index, height);
      }
    }, [index, onResize, itemData]);

    return (
      <div style={style}>
        <div ref={rowRef} className="py-2">
          <CommandItem
            value={itemData}
            onSelect={() => {
              if (checked) {
                removeKeyword(itemData);
              } else {
                addKeyword(itemData);
              }
            }}
            disabled={checked && name === "profile"}
            className="cursor-pointer"
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                checked ? "opacity-100" : "opacity-0"
              )}
            />
            {itemData}
          </CommandItem>
        </div>
      </div>
    );
  }
);

function ItemsList({
  searchTerm,
  setSearchTerm,
  isVirtualized,
  filteredAvailableItems,
  Row,
  initialKeywords,
  addKeyword,
  removeKeyword,
  name,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isVirtualized: boolean;
  filteredAvailableItems: string[];
  Row: React.MemoExoticComponent<
    ({
      index,
      style,
      data,
    }: {
      index: number;
      style: CSSProperties;
      data: {
        filteredAvailableItems: string[];
        initialKeywords: string[];
        addKeyword: (keyword: string) => void;
        removeKeyword: (keyword: string) => void;
        onResize: (index: number, size: number) => void;
      };
      name: keyof GenericFormData;
    }) => ReactElement
  >;
  initialKeywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  name: keyof GenericFormData;
}) {
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const listRef = useRef<VariableSizeList | null>(null);

  const handleResize = useCallback(
    (index: number, size: number) => {
      if (rowHeights[index] !== size) {
        setRowHeights((prev) => ({ ...prev, [index]: size }));
        if (listRef.current) {
          listRef.current.resetAfterIndex(index);
        }
      }
    },
    [rowHeights]
  );

  const RowWithDynamicHeight = useCallback(
    ({ index, style }: { index: number; style: CSSProperties }) => (
      <Row
        index={index}
        style={style}
        name={name}
        data={{
          filteredAvailableItems,
          initialKeywords,
          addKeyword,
          removeKeyword,
          onResize: handleResize,
        }}
      />
    ),
    [
      filteredAvailableItems,
      initialKeywords,
      addKeyword,
      removeKeyword,
      handleResize,
      Row,
    ]
  );

  const getItemSize = useCallback(
    (index: number) => {
      return rowHeights[index] || 40;
    },
    [rowHeights]
  );

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty
          className={`${
            name === "profile" && "py-10"
          } text-secondary-foreground text-center py-5`}
        >
          No items available
        </CommandEmpty>
        <CommandGroup>
          {isVirtualized
            ? filteredAvailableItems.length > 0 && (
                <div className="h-60 w-full">
                  <AutoSizer>
                    {({ height, width }) => (
                      <VariableSizeList
                        ref={listRef}
                        height={height}
                        itemCount={filteredAvailableItems.length}
                        itemSize={getItemSize}
                        width={width}
                      >
                        {RowWithDynamicHeight}
                      </VariableSizeList>
                    )}
                  </AutoSizer>
                </div>
              )
            : filteredAvailableItems.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  disabled={
                    initialKeywords.includes(item) && name === "profile"
                  }
                  onSelect={() => {
                    if (initialKeywords.includes(item)) {
                      removeKeyword(item);
                    } else {
                      addKeyword(item);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      initialKeywords.includes(item)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {item}
                </CommandItem>
              ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
