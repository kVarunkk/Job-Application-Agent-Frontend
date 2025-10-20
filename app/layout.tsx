import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "react-hot-toast";
import { ProgressBar, ProgressBarProvider } from "react-transition-progress";

export const metadata: Metadata = {
  title: {
    default: "GetHired - Your smartest path to the perfect job",
    template: "%s | GetHired",
  },
  description: "Your smartest path to the perfect job.",
  metadataBase: new URL("https://gethired.devhub.co.in"),
  robots: {
    index: true,
    follow: true,
  },
  keywords: [
    "job search",
    "ai job application",
    "personalized job recommendations",
    "automated job applications",
    "job matching",
    "career advancement",
    "job hunting",
    "tech jobs",
    "remote jobs",
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.className} antialiased text-sm sm:text-base`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ProgressBarProvider>
              <ProgressBar className="fixed h-1 rounded-r-md shadow-lg shadow-sky-500/20 bg-primary top-0" />
              {children}
            </ProgressBarProvider>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
