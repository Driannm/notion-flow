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
import { PLATFORM_GROUPS } from "@/lib/constants";

interface PlatformSelectProps {
  value: string;
  onChange: (val: string) => void;
}

export function PlatformSelect({ value, onChange }: PlatformSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full h-12">
        <SelectValue placeholder="Pilih Platform" />
      </SelectTrigger>

      <SelectContent className="max-h-[300px]">
        {Object.entries(PLATFORM_GROUPS).map(([groupName, platforms], index) => (
          <div key={groupName}>
            {index > 0 && <SelectSeparator className="my-2" />}
            <SelectGroup>
              <SelectLabel className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-xs font-semibold text-muted-foreground/70">
                {groupName}
              </SelectLabel>
              {platforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectGroup>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
