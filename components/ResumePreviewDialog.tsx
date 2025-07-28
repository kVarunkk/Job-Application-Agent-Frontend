"use client";

import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { FileText } from "lucide-react";

export default function ResumePreviewDialog({
  displayUrl,
  isPdf,
}: {
  displayUrl: string;
  isPdf: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <FileText className="w-4 h-4" />
          View Resume
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] h-[90vh] p-0">
        {isPdf ? (
          <iframe
            src={displayUrl}
            className="w-full h-full border-none"
            title="Resume Preview"
          >
            Your browser does not support PDFs. You can{" "}
            <a href={displayUrl} target="_blank" rel="noopener noreferrer">
              download the resume here
            </a>
            .
          </iframe>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <p className="text-lg font-semibold mb-2">
              File type not directly viewable.
            </p>
            <p className="text-sm text-gray-600">
              This file type ({displayUrl.split(".").pop()?.toUpperCase()})
              cannot be embedded directly.
            </p>
            <a
              href={displayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-blue-600 hover:underline flex items-center gap-1"
            >
              <FileText className="w-4 h-4" /> Download File
            </a>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
