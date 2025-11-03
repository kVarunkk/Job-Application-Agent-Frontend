"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  startTransition,
} from "react";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import toast from "react-hot-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming this path
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useProgress } from "react-transition-progress";

interface ParsedFilters {
  [key: string]: string | string[] | undefined;
}

const premadePrompts = [
  "Show me remote frontend jobs for a senior engineer.",
  "I'm looking for full-time backend roles in New York.",
  "Find entry-level data science internships in San Francisco.",
  "What are the latest Java developer jobs, minimum salary $90k?",
  "Show me jobs from Google or Microsoft.",
  "Remote jobs with visa sponsorship required.",
  "I want to see all react native jobs that are reviewed.",
  "Find jobs sorted by highest salary.",
  "Show me contract DevOps roles.",
];

export default function GlobalJobSearch({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUses, setSearchUses] = useState(0);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const startProgress = useProgress();

  const fetchUserData = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_info")
      .select("ai_global_jobs_search_uses")
      .eq("user_id", user.id)
      .single();
    if (data && !error) {
      return data.ai_global_jobs_search_uses;
    } else return null;
  }, [user]);

  const updateUserData = async (search_uses: number) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_info")
      .update({ ai_global_jobs_search_uses: search_uses + 1 })
      .eq("user_id", user.id);
    if (!error) {
      setSearchUses((prev) => prev + 1);
    }
  };

  useEffect(() => {
    (async () => {
      const search_uses = await fetchUserData();
      setSearchUses(search_uses);
    })();
  }, [fetchUserData]);

  const buildUrlParams = useCallback(
    (filters: ParsedFilters): URLSearchParams => {
      const params = new URLSearchParams();

      for (const key in filters) {
        const value = filters[key];
        if (value === undefined || value === null) continue;

        if (Array.isArray(value) && value.length > 0) {
          params.set(key, value.join("|"));
        } else if (typeof value === "string" && value) {
          params.set(key, value);
        }
      }

      return params;
    },
    []
  );

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const search_uses = await fetchUserData();
    if (search_uses >= 5) {
      setError("No more Searches left today :(. Resets every day.");
    }
    const query = formData.get("searchQuery")?.toString()?.trim();

    if (!query) return;

    if (query.length > 100) {
      setError("Prompt should be shorter than 100 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-search/global/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: query }),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(
          errorResult.error ||
            `AI parsing failed with status ${response.status}`
        );
      }

      const { filters } = await response.json();

      const params = buildUrlParams(filters);

      await updateUserData(search_uses);

      startTransition(() => {
        startProgress();
        router.push(`/jobs?${params.toString()}`);
      });

      setIsOpen(false);
    } catch (error) {
      toast.error(
        `Search failed: ${(error as Error).message}. Please try again.`
      );
      //   console.error("AI Search Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (searchInputRef.current) {
      searchInputRef.current.value = prompt; // Set input value
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          title="AI Search"
          variant="ghost"
          size="icon"
          aria-label="Open global job search"
        >
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-start">
            What kind of job are you looking for?
          </DialogTitle>
          <DialogDescription className="text-start">
            {5 - searchUses} Searches left today. Resets every day.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
          className="flex flex-col space-y-4"
        >
          <Input
            type="text"
            required
            placeholder="e.g., Senior Java jobs in London with visa sponsorship"
            name="searchQuery"
            disabled={isLoading}
            className="bg-input text-sm"
            ref={searchInputRef}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger className="text-sm">
                Need inspiration? Try these prompts:
              </AccordionTrigger>
              <AccordionContent>
                <div className="max-h-[150px] overflow-y-auto pr-2">
                  {" "}
                  {/* Fixed height and scrollable */}
                  <div className="flex flex-col space-y-2">
                    {premadePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="justify-start h-auto px-2 py-1 text-sm text-muted-foreground  whitespace-normal text-left"
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Search Jobs
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
