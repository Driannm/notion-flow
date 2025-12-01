"use client";

import { CATEGORY_IDS, ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  value: string;
  onChange: (val: string) => void;
}

export function CategoryGrid({ value, onChange }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
      {Object.keys(CATEGORY_IDS).map((cat) => {
        const Icon = ICON_MAP[cat] || ICON_MAP["default"];
        const isActive = value === cat;

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 gap-2",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-[1.02]"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive ? "animate-bounce-short" : "")} />
            <span className="text-xs font-medium truncate w-full text-center">
              {cat}
            </span>
          </button>
        );
      })}
    </div>
  );
}
