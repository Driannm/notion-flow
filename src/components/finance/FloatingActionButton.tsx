"use client";

import * as React from "react";
import { Plus, Edit, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export type FABVariant = "primary" | "secondary" | "accent";
export type FABIcon = "plus" | "edit" | "filter" | "search";

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: FABIcon;
  variant?: FABVariant;
  label?: string;
  showLabel?: boolean;
  position?: "bottom-right" | "bottom-center" | "bottom-left";
  className?: string;
}

const iconMap: Record<FABIcon, React.ReactNode> = {
  plus: <Plus className="w-6 h-6" />,
  edit: <Edit className="w-6 h-6" />,
  filter: <Filter className="w-6 h-6" />,
  search: <Search className="w-6 h-6" />,
};

const variantConfig: Record<FABVariant, {
  bg: string;
  hover: string;
  text: string;
  shadow: string;
}> = {
  primary: {
    bg: "bg-zinc-900 dark:bg-zinc-100",
    hover: "hover:bg-zinc-800 dark:hover:bg-zinc-200",
    text: "text-white dark:text-black",
    shadow: "shadow-xl shadow-zinc-400/30 dark:shadow-black/50",
  },
  secondary: {
    bg: "bg-zinc-800 dark:bg-zinc-200",
    hover: "hover:bg-zinc-700 dark:hover:bg-zinc-300",
    text: "text-white dark:text-black",
    shadow: "shadow-xl shadow-zinc-400/20 dark:shadow-zinc-500/30",
  },
  accent: {
    bg: "bg-emerald-600",
    hover: "hover:bg-emerald-700",
    text: "text-white",
    shadow: "shadow-xl shadow-emerald-400/30 dark:shadow-black/50",
  },
};

export default function FloatingActionButton({
  onClick,
  icon = "plus",
  variant = "primary",
  label = "Add",
  showLabel = false,
  position = "bottom-right",
  className = "",
}: FloatingActionButtonProps) {
  const config = variantConfig[variant];

  const positionClasses = {
    "bottom-right": "right-4 justify-end",
    "bottom-center": "right-1/2 translate-x-1/2 justify-center",
    "bottom-left": "left-4 justify-start",
  }[position];

  return (
    <div className={`fixed bottom-6 ${positionClasses} max-w-md w-full px-4 flex items-center pointer-events-none z-50 ${className}`}>
      <Button
        onClick={onClick}
        className={`
          h-14 ${showLabel ? 'px-6' : 'w-14'} 
          rounded-[1.2rem] 
          ${config.shadow}
          ${config.bg}
          ${config.hover}
          ${config.text}
          pointer-events-auto 
          flex items-center justify-center 
          transition-transform active:scale-90
          gap-2
        `}
      >
        {iconMap[icon]}
        {showLabel && (
          <span className="font-medium text-sm">
            {label}
          </span>
        )}
      </Button>
    </div>
  );
}