"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export default function AgentMessage({
  content,
  isLast,
  submitUserInput,
}: {
  content: string;
  isLast: boolean;
  submitUserInput: (input: string) => Promise<void>;
}) {
  const marker = "<-- SUGGESTIONS -->";
  const [mainContent, suggestionBlock] = content.split(marker);
  const suggestions = suggestionBlock
    ? suggestionBlock
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "" && line.trim() !== "-->")
        .map((_) => ({
          id: uuidv4(),
          content: _,
        }))
    : [];

  return (
    <div className="mb-4 p-3 rounded-lg justify-start whitespace-pre-wrap">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold my-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold my-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium my-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className=" leading-relaxed text-sm sm:text-base" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 pl-4" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-1 pl-4"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="ml-2" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          code: ({ node, className, children, ...props }) => (
            <pre className="bg-black text-white p-4 rounded overflow-x-auto my-4">
              <code className="text-sm" {...props}>
                {children}
              </code>
            </pre>
          ),
        }}
      >
        {mainContent}
      </ReactMarkdown>

      {suggestions.length > 0 && isLast && (
        <div className="flex items-center flex-wrap gap-2 mt-4">
          {suggestions.map((each) => (
            <Button
              onClick={() => submitUserInput(each.content)}
              key={each.id}
              variant={"outline"}
            >
              {each.content} <ChevronRight />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
