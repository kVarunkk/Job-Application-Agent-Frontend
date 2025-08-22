"use client";

import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { CSSProperties, useMemo, useState } from "react";

type Props = {
  items: string[];
  selectedItem: string;
  handleItemChange: (val: string) => void;
  isLoading: boolean;
  placeholder: string;
};

export default function VirtualizedSelect({
  items,
  selectedItem,
  handleItemChange,
  isLoading,
  placeholder,
}: Props) {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredAvailableItems = useMemo(() => {
    return items.filter((item) =>
      item.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

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
        <VirtualizedItem onClick={() => handleItemChange(itemData)}>
          <div className="whitespace-normal">{itemData}</div>
        </VirtualizedItem>
      </div>
    );
  };

  return (
    <Select value={selectedItem} disabled={isLoading}>
      <SelectTrigger className="bg-input">
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder}>
          {selectedItem || (isLoading ? "Loading..." : placeholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className=" pl-1 flex items-center gap-1 sticky top-0 bg-background z-10 border-b">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="text-sm border-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredAvailableItems.length > 0 && (
          <div className="h-60 w-full">
            <AutoSizer>
              {({ height, width }) => (
                <List
                  height={height}
                  itemCount={items.length}
                  itemSize={45}
                  width={width}
                >
                  {Row}
                </List>
              )}
            </AutoSizer>
          </div>
        )}
        {filteredAvailableItems.length === 0 && (
          <div className="text-sm p-2 text-center">No items available</div>
        )}
      </SelectContent>
    </Select>
  );
}
