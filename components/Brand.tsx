"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface BrandProps {
  type: "long" | "short";
}

export default function Brand({ type }: BrandProps) {
  const { theme, systemTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<
    "light" | "dark" | undefined
  >(undefined);

  useEffect(() => {
    if (theme === "system") {
      setCurrentTheme(systemTheme === "dark" ? "dark" : "light");
    } else {
      setCurrentTheme(theme === "dark" ? "dark" : "light");
    }
  }, [theme, systemTheme]);

  const imageUrls = {
    long: {
      light: "/logos/long-light.png",
      dark: "/logos/long-dark.png",
    },
    short: {
      dark: "/logos/short-dark.png",
      light: "/logos/short-light.png",
    },
  };

  const getBrandImageSrc = () => {
    if (!currentTheme) {
      return null;
    }
    return currentTheme === "dark"
      ? imageUrls[type].dark
      : imageUrls[type].light;
  };

  const src = getBrandImageSrc();

  if (!src) {
    return null;
  }

  if (type) {
    return (
      <div
        className={
          type === "long"
            ? "relative w-[100px] sm:w-[150px] h-[30px] sm:h-[40px] md:h-[50px]"
            : "relative w-[32px] sm:w-[40px] md:w-[50px] h-[32px] sm:h-[40px] md:h-[50px]"
        }
      >
        <Image
          src={src}
          alt={`${type} brand logo (${currentTheme} mode)`}
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    );
  } else return null;
}
