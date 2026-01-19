import * as React from "react";

interface UseFinanceFilterProps<T> {
  initialData: T[];
  searchFields: (keyof T)[];
  filterField: keyof T;
}

export function useFinanceFilter<T extends Record<string, any>>({
  initialData,
  searchFields,
  filterField,
}: UseFinanceFilterProps<T>) {
  // State
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState<"latest" | "highest" | "lowest">("latest");

  // Get all unique filters
  const allFilters = React.useMemo(
    () => Array.from(new Set(initialData.map((item) => String(item[filterField])))),
    [initialData, filterField]
  );

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and sort data
  const filteredData = React.useMemo(() => {
    let data = [...initialData];

    // Search filter
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      data = data.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Category/source filter
    if (selectedFilters.length > 0) {
      data = data.filter((item) =>
        selectedFilters.includes(String(item[filterField]))
      );
    }

    // Sort
    if (sortOption === "highest") {
      data.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    } else if (sortOption === "lowest") {
      data.sort((a, b) => (a.amount || 0) - (b.amount || 0));
    } else {
      // Latest default - sort by date
      data.sort((a, b) => {
        const dateA = a.dateObj instanceof Date ? a.dateObj : new Date(a.date || a.createdAt || 0);
        const dateB = b.dateObj instanceof Date ? b.dateObj : new Date(b.date || b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
    }

    return data;
  }, [initialData, debouncedSearch, selectedFilters, sortOption, searchFields, filterField]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    selectedFilters,
    setSelectedFilters,
    sortOption,
    setSortOption,
    
    // Derived data
    allFilters,
    filteredData,
  };
}