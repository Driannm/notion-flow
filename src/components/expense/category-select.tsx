"use client";

import { CATEGORY_GROUPS, ICON_MAP } from "@/lib/constants"; // Pastikan import CATEGORY_GROUPS
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
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-12">
        <div className="flex items-center gap-3 text-left">
          <span className="truncate">
            <SelectValue placeholder="Pilih Kategori" />
          </span>
        </div>
      </SelectTrigger>

      <SelectContent className="max-h-[300px]">
        {/* 2. Loop melalui Object CATEGORY_GROUPS */}
        {Object.entries(CATEGORY_GROUPS).map(([groupName, categories], index) => (
          <div key={groupName}>
            {/* Tambahkan separator antar group, kecuali di paling atas */}
            {index > 0 && <SelectSeparator className="my-2" />}
            
            <SelectGroup>
              <SelectLabel className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
                {groupName}
              </SelectLabel>

              {categories.map((cat) => {
                const Icon = ICON_MAP[cat] || ICON_MAP["default"];
                return (
                  <SelectItem key={cat} value={cat} className="cursor-pointer pl-8">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{cat}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </div>
        ))}
        
        {/* Opsional: Handle kategori yang mungkin lupa dimasukkan ke grup */}
         {/* Kamu bisa menambahkan logic 'Other' disini jika perlu */}
      </SelectContent>
    </Select>
  );
}