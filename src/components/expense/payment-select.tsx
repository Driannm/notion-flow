"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_GROUPS } from "@/lib/constants";

interface PaymentSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function PaymentSelect({ value, onChange }: PaymentSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-12">
        <SelectValue placeholder="Pilih Metode Pembayaran" />
      </SelectTrigger>

      <SelectContent className="max-h-[300px]">
        {Object.entries(PAYMENT_GROUPS).map(([groupName, methods], index) => (
          <div key={groupName}>
            {index > 0 && <SelectSeparator className="my-2" />}
            <SelectGroup>
              <SelectLabel className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
                {groupName}
              </SelectLabel>
              {methods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectGroup>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
