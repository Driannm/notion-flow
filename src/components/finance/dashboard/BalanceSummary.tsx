/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SummaryCard {
  id: number;
  title: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  amount: string;
}

interface YourMoneySectionProps {
  loading: boolean;
  summaryCards: SummaryCard[];
}

export default function YourMoneySection({
  loading,
  summaryCards,
}: YourMoneySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const totalPages = Math.ceil(summaryCards.length / 2);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const pageWidth = container.offsetWidth;
    const index = Math.round(container.scrollLeft / pageWidth);
    setActiveCardIndex(index);
  };

  const scrollToIndex = (pageIndex: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    container.scrollTo({
      left: container.offsetWidth * pageIndex,
      behavior: "smooth",
    });
    setActiveCardIndex(pageIndex);
  };

  return (
    <div className="-mx-4 bg-white dark:bg-gray-900 rounded-3xl px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Your Money
          </h2>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth snap-x snap-mandatory"
          onScroll={handleScroll}
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-center border-1 w-[48%] min-w-[48%] max-w-[48%] flex-shrink-0 snap-start shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div
                    className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mx-auto`}
                  >
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>

                  <div className="px-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center justify-center gap-1">
                      {card.title}
                    </p>

                    <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-tight break-words whitespace-normal flex justify-center font-mono">
                      {loading ? (
                        <Skeleton className="h-6 w-50 mx-auto rounded-full bg-white/30" />
                      ) : (
                        card.amount
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                activeCardIndex === index
                  ? "w-6 bg-gray-800 dark:bg-gray-300"
                  : "w-1.5 bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}