"use client";

import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer"; // optional but nice for dynamic width
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = {
  items: string[];
  selectedItem: string;
  handleItemChange: (val: string) => void;
  isLoading: boolean;
};

export default function VirtualizedSelect({
  items,
  selectedItem,
  handleItemChange,
  isLoading,
}: Props) {
  return (
    <Select
      onValueChange={(value) => handleItemChange(value)}
      value={selectedItem}
      disabled={isLoading}
    >
      <SelectTrigger className="bg-input">
        <SelectValue placeholder={isLoading ? "Loading..." : "Select Country"}>
          {selectedItem || (isLoading ? "Loading..." : "Select Country")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <div className="h-60 w-full">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                itemCount={items.length}
                itemSize={45}
                width={width}
              >
                {({ index, style }) => {
                  const itemData = items[index];
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
      </SelectContent>
    </Select>
  );
}
