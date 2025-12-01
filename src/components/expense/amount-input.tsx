"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pl-1">
        Total Nominal (Subtotal)
      </Label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl">
          Rp
        </span>
        <Input
          name="subtotal"
          type="number"
          inputMode="numeric"
          placeholder="0"
          className="pl-12 h-16 text-3xl font-bold bg-background border-2 border-muted focus-visible:border-primary focus-visible:ring-0 rounded-2xl transition-all"
          value={value}
          onChange={onChange}
          autoComplete="off"
        />
      </div>
    </div>
  );
}