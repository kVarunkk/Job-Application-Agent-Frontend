"use client";

import { X } from "lucide-react";
import { useState } from "react";

export default function PopoverInfo() {
  const [open, setOpen] = useState(true);

  if (open) {
    return (
      <div
        className="absolute bottom-0 w-full p-2"
        style={{
          background: "hsl(var(--popover))",
        }}
      >
        <button className="absolute top-1 right-1">
          <X
            className="h-4 w-4 cursor-pointer text-muted-foreground"
            onClick={() => setOpen(false)}
          />
        </button>
        <p className="text-xs text-secondary-foreground">
          Create application for the user for your job postings. Once selected,
          you wont be able to deselect. Go to the applications tab to see the
          status of applications.
        </p>
      </div>
    );
  } else return <></>;
}
