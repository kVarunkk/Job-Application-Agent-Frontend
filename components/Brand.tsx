"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Define the shape of the props for better type safety
interface BrandProps {
  type: "long" | "short";
}

export default function Brand({ type }: BrandProps) {
  const { theme, systemTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<
    "light" | "dark" | undefined
  >(undefined);

  // Determine the effective theme (light or dark)
  useEffect(() => {
    if (theme === "system") {
      setCurrentTheme(systemTheme === "dark" ? "dark" : "light");
    } else {
      setCurrentTheme(theme === "dark" ? "dark" : "light");
    }
  }, [theme, systemTheme]);

  // Define your image URLs based on type and mode
  const imageUrls = {
    long: {
      light:
        "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/logos/Group%2011.png", // Path to your long logo for light mode
      dark: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/logos/Group%2010.png", // Path to your long logo for dark mode
    },
    short: {
      dark: "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/logos/Group%206.png", // Path to your short logo for light mode
      light:
        "https://vehnycoyrmqdfywybboc.supabase.co/storage/v1/object/public/images/landing_page/logos/Group%207.png", // Path to your short logo for dark mode
    },
  };

  // Determine the correct image source based on props and effective theme
  const getBrandImageSrc = () => {
    if (!currentTheme) {
      // Return a default or null while theme is being determined
      return null;
    }
    return currentTheme === "dark"
      ? imageUrls[type].dark
      : imageUrls[type].light;
  };

  const src = getBrandImageSrc();

  if (!src) {
    // Render nothing or a placeholder until the theme is determined
    return null;
  }

  return (
    <Image
      src={src}
      alt={`${type} brand logo (${currentTheme} mode)`}
      // You'll need to define appropriate width and height for your logos
      // These are example values, adjust them based on your image dimensions
      width={type === "long" ? 150 : 50} // Example: 200px for long, 50px for short
      height={type === "long" ? 100 : 50} // Example: 50px for both
      priority // Consider using priority for logos that are above the fold
    />
  );
}
