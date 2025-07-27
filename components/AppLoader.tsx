"use client";

type AppLoaderProps = {
  size?: "sm" | "md" | "lg";
  color?: string;
};

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export default function AppLoader({ size = "md", color }: AppLoaderProps) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 ${
        color ? `border-${color}` : "border-black dark:border-white"
      } ${sizeClasses[size]}`}
    ></div>
  );
}
