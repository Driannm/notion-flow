"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

interface SearchFilterBarProps {
  // Search props
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  
  // Filter props
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  allFilters: string[];
  filterTitle?: string;
  
  // Sort props
  sortOption: "latest" | "highest" | "lowest";
  onSortChange: (option: "latest" | "highest" | "lowest") => void;
  
  // Labels
  filterLabel?: string;
  sortLabel?: string;
}

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  selectedFilters,
  onFilterChange,
  allFilters,
  filterTitle = "Categories",
  sortOption,
  onSortChange,
  filterLabel = "Filters",
  sortLabel = "Sort By",
}: SearchFilterBarProps) {
  return (
    <div className="sticky top-[57px] z-20 -mx-4 px-4 pb-2 pt-2 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-transparent transition-all">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200 transition-colors" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-zinc-100 dark:bg-zinc-900 border-none shadow-none rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-700 placeholder:text-zinc-400"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Drawer */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm shrink-0 relative"
            >
              <SlidersHorizontal className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              {/* Active Indicator */}
              {(selectedFilters.length > 0 || sortOption !== "latest") && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="border-0">
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>{filterLabel}</DrawerTitle>
                <DrawerDescription>Customize your view.</DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-6">
                {/* Sort Section */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {sortLabel}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSortChange("latest")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                        sortOption === "latest"
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Latest
                    </button>
                    <button
                      onClick={() => onSortChange("highest")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                        sortOption === "highest"
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Highest
                    </button>
                    <button
                      onClick={() => onSortChange("lowest")}
                      className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${
                        sortOption === "lowest"
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      Lowest
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Filter Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      {filterTitle}
                    </h3>
                    {selectedFilters.length > 0 && (
                      <button
                        onClick={() => onFilterChange([])}
                        className="text-xs text-red-500 font-medium hover:text-red-600 transition-colors"
                      >
                        Reset All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allFilters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          if (selectedFilters.includes(filter)) {
                            onFilterChange(selectedFilters.filter((f) => f !== filter));
                          } else {
                            onFilterChange([...selectedFilters, filter]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selectedFilters.includes(filter)
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button className="w-full h-12 rounded-xl text-base bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
                    Show Results
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}