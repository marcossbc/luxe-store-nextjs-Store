"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({ value, onChange, min = 1, max = 99, className }: QuantitySelectorProps) {
  return (
    <div className={cn("flex items-center border rounded-xl bg-background", className)}>
      <Button variant="ghost" size="icon-sm" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
        <Minus size={14} />
      </Button>
      <span className="w-10 text-center text-sm font-semibold">{value}</span>
      <Button variant="ghost" size="icon-sm" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>
        <Plus size={14} />
      </Button>
    </div>
  );
}
