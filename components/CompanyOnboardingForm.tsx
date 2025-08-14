"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  website: z
    .string()
    .url({ message: "Invalid URL format." })
    .optional()
    .or(z.literal("")),
  industry: z.string().optional(),
  headquarters: z.string().optional(),
  company_size: z.string().optional(),
  logo_url: z
    .string()
    .url({ message: "Invalid URL format." })
    .optional()
    .or(z.literal("")),
});

export default function CompanyOnboardingForm({ user }: { user: User | null }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      website: "",
      industry: "",
      headquarters: "",
      company_size: "",
      logo_url: "",
    },
  });

  useEffect(() => {
    (async () => {
      if (!user) return;

      const supabase = createClient();
      const { data: existingValues, error } = await supabase
        .from("company_info")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching existing company info:", error);
        return;
      }
      if (existingValues) {
        form.reset({
          name: existingValues.name || "",
          description: existingValues.description || "",
          website: existingValues.website || "",
          industry: existingValues.industry || "",
          headquarters: existingValues.headquarters || "",
          company_size: existingValues.company_size || "",
          logo_url: existingValues.logo_url || "",
        });
      }
    })();
  }, [user, form]);

  const onSubmit = async (values: {
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    headquarters?: string;
    company_size?: string;
    logo_url?: string;
  }) => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("company_info").upsert(
        {
          user_id: user?.id,
          ...values,
          filled: true,
        },
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;

      toast.success("Information Saved Successfully!");
      router.push("/company");
    } catch (error) {
      console.error("API call failed:", error);
      toast.error(
        "Some error occured while saving Information, Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ];

  return (
    <div className="flex flex-col gap-10 items-center justify-center mt-32 mb-32  p-4">
      <p className="text-6xl font-bold max-w-2xl w-full ">
        Let&apos;s Hire, quickly.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((value) => onSubmit(value))}
          className="w-full space-y-6 max-w-2xl"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Company Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="bg-input"
                    placeholder="Acme Inc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about your company..."
                    className="resize-none bg-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Website</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-input"
                      placeholder="https://www.acme.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-input"
                      placeholder="Technology"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="headquarters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headquarters Location</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-input"
                      placeholder="San Francisco, CA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Size</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Logo URL</FormLabel>
                <FormControl>
                  <Input
                    className="bg-input"
                    placeholder="https://www.acme.com/logo.png"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Onboarding"
            )}
          </Button>
        </form>
      </Form>
      <p className="text-muted-foreground text-xs text-center mt-5">
        No need to panic, you can always update this information.
      </p>
    </div>
  );
}
