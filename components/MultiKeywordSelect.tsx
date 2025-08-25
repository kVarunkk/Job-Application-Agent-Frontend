"use client";

import {
  useState,
  useCallback,
  useMemo,
  CSSProperties,
  ReactElement,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FixedSizeList as List } from "react-window";
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
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

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
  placeholder = "Select items...",
  initialKeywords = [],
  className = "",
  availableItems = [],
  isVirtualized = false,
}: MultiKeywordSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
      // setOpen(false);
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

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: CSSProperties;
  }): ReactElement => {
    const itemData = filteredAvailableItems[index];
    return (
      <div style={style}>
        <CommandItem
          value={itemData}
          onSelect={() => addKeyword(itemData)}
          className="cursor-pointer"
        >
          {itemData}
        </CommandItem>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-2 ", className)}>
      {isDesktop ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-input text-muted-foreground"
            >
              <span className="truncate">{placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 " style={{ pointerEvents: "auto" }}>
            <ItemsList
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isVirtualized={isVirtualized}
              filteredAvailableItems={filteredAvailableItems}
              Row={Row}
              initialKeywords={initialKeywords}
              addKeyword={addKeyword}
            />
          </PopoverContent>
        </Popover>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-input text-muted-foreground"
            >
              <span className="truncate">{placeholder}</span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
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
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

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

function ItemsList({
  searchTerm,
  setSearchTerm,
  isVirtualized,
  filteredAvailableItems,
  Row,
  initialKeywords,
  addKeyword,
}: {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  isVirtualized: boolean;
  filteredAvailableItems: string[];
  Row: ({
    index,
    style,
  }: {
    index: number;
    style: CSSProperties;
  }) => ReactElement;
  initialKeywords: string[];
  addKeyword: (keyword: string) => void;
}) {
  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search..."
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No items available</CommandEmpty>
        <CommandGroup>
          {isVirtualized
            ? filteredAvailableItems.length > 0 && (
                <div className="h-60 w-full">
                  <AutoSizer>
                    {({ height, width }) => (
                      <List
                        height={height}
                        itemCount={filteredAvailableItems.length}
                        itemSize={40}
                        width={width}
                      >
                        {Row}
                      </List>
                    )}
                  </AutoSizer>
                </div>
              )
            : filteredAvailableItems.map((item) => (
                <CommandItem
                  key={item}
                  value={item}
                  onSelect={() => addKeyword(item)}
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
