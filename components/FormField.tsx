import { Label } from "@/components/ui/label";
import { ReactNode } from "react";
import InfoTooltip from "./InfoTooltip";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  tooltip?: string;
}

export function FormField({
  label,
  htmlFor,
  children,
  tooltip,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="flex items-center gap-2">
        {label}
        {tooltip && <InfoTooltip content={<p>{tooltip}</p>} />}
      </Label>
      {children}
    </div>
  );
}
