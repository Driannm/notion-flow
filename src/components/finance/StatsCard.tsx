"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface StatsCardProps {
  // Data & Content
  title: string;
  mainValue: string | number;
  mainIcon?: React.ReactNode;
  subtitle?: string;
  stats: StatItem[];
  
  // Styling
  theme?: "expense" | "income" | "neutral";
  className?: string;
  
  // Interaction
  swipeable?: boolean;
  currentIndex?: number;
  totalPages?: number;
  onSwipe?: (direction: number) => void;
  
  // Animation
  direction?: number;
}

export default function StatsCard({
  title,
  mainValue,
  mainIcon = <Calendar className="w-5 h-5" />,
  subtitle,
  stats,
  theme = "neutral",
  className = "",
  swipeable = true,
  currentIndex = 0,
  totalPages = 2,
  onSwipe,
  direction = 0,
}: StatsCardProps) {
  const themeConfig = {
    expense: {
      bg: "bg-zinc-900 dark:bg-zinc-100",
      text: "text-white dark:text-zinc-900",
      accent: "text-zinc-400 dark:text-zinc-500",
      border: "border-white/10 dark:border-black/5",
      shadow: "shadow-xl shadow-zinc-300/30 dark:shadow-none",
    },
    income: {
      bg: "bg-gradient-to-br from-emerald-700 to-emerald-500",
      text: "text-white",
      accent: "text-emerald-100",
      border: "border-white/10",
      shadow: "shadow-xl shadow-emerald-300/30 dark:shadow-none",
    },
    neutral: {
      bg: "bg-gradient-to-br from-blue-700 to-blue-500",
      text: "text-white",
      accent: "text-blue-100",
      border: "border-white/10",
      shadow: "shadow-xl shadow-blue-300/30",
    },
  }[theme];

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  };

  const handleDragEnd = (event: any, info: any) => {
    if (!swipeable || !onSwipe) return;
    
    const swipe = Math.abs(info.offset.x) * info.velocity.x;
    if (swipe < -1000) onSwipe(-1);
    else if (swipe > 1000) onSwipe(1);
  };

  const content = (
    <div className={`h-full rounded-[2rem] p-6 flex flex-col justify-between overflow-hidden relative ${themeConfig.bg} ${themeConfig.text} ${themeConfig.shadow} ${className}`}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${themeConfig.accent}`}>
            {title}
          </p>
          {subtitle && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-md ${themeConfig.accent}`}>
                {subtitle}
              </span>
            </div>
          )}
        </div>
        <div className={`bg-white/10 p-2 rounded-full ${themeConfig.accent}`}>
          {mainIcon}
        </div>
      </div>

      {/* Main Value */}
      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tighter">
          {mainValue}
        </h1>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className={`grid grid-cols-${Math.min(stats.length, 4)} gap-2 pt-4 border-t ${themeConfig.border} relative z-10`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className={`text-[10px] uppercase tracking-widest mb-0.5 ${themeConfig.accent}`}>
                {stat.label}
              </p>
              <p className="text-xs font-bold font-mono">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Dots */}
      {swipeable && totalPages > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                currentIndex === idx
                  ? "bg-white"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (!swipeable) {
    return <div className="relative h-[200px] w-full">{content}</div>;
  }

  return (
    <div className="relative h-[200px] w-full">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute w-full h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}