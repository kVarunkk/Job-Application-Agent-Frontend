"use client";

import { useLinkStatus } from "next/link";

export default function LoadingIndicator() {
  const { pending } = useLinkStatus();
  return pending ? (
    <div
      role="status"
      aria-label="Loading"
      className="spinner h-5 w-5 text-white"
    />
  ) : null;
}
