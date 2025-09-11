"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { useProgress } from "react-transition-progress";

export default function ProgressBtn({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const router = useRouter();
  const startProgress = useProgress();

  const handleNavigation = () => {
    startTransition(() => {
      startProgress();
      if (href.startsWith("http")) {
        window.location.href = href; // external
      } else {
        router.push(href); // internal
      }
    });
  };

  return (
    <button className={className} onClick={handleNavigation}>
      {children}
    </button>
  );
}
