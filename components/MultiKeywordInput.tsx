"use client";

import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { v4 as uuidv4 } from "uuid";
import { Check, X } from "lucide-react";
import { IFormValues } from "./CreateWorkflowForm";

interface MultiKeywordInputProps {
  updateFormValues: (
    type: keyof Pick<
      IFormValues,
      "included_keywords" | "excluded_keywords" | "title_included_keywords"
    >,
    keywords: {
      id: string;
      content: string;
    }[]
  ) => void;
  type: keyof Pick<
    IFormValues,
    "included_keywords" | "excluded_keywords" | "title_included_keywords"
  >;
  placeholder?: string;
}

export default function MultiKeywordInput({
  type,
  updateFormValues,
  placeholder,
}: MultiKeywordInputProps) {
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<
    {
      id: string;
      content: string;
    }[]
  >([]);

  useEffect(() => {
    updateFormValues(type, keywords);
  }, [keywords]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      setKeywords((prev) => [
        ...prev,
        {
          id: uuidv4(),
          content: input.trim(),
        },
      ]);
      setInput("");
    }
  };

  const addKeyword = () => {
    if (!input.trim()) return;
    setKeywords((prev) => [
      ...prev,
      {
        id: uuidv4(),
        content: input.trim(),
      },
    ]);
    setInput("");
  };

  const removeKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((_) => _.id !== id));
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <Input
        id={type}
        name={type}
        placeholder={placeholder ?? ""}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {input.trim() && (
        <div className="flex items-center absolute right-1 top-1 text-muted-foreground">
          <button
            onClick={() => setInput("")}
            className="p-1 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </button>
          <button onClick={addKeyword} className="p-1 hover:text-primary">
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map(({ content, id }) => (
            <span
              key={id}
              className="flex items-center border border-border text-muted-foreground px-2 py-1 rounded text-sm"
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
