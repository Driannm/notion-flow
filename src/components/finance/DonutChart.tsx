"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, PieChartIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
export interface DonutChartDataItem {
  name: string;
  value: number;
}

export interface DonutChartProps {
  data: DonutChartDataItem[];
  title?: string;
  total?: number;
  type?: "expense" | "income";
  currency?: string;
  locale?: string;
  className?: string;
  showLegend?: boolean;
  showStats?: boolean;
  onSegmentClick?: (item: DonutChartDataItem, index: number) => void;
}

// Format helper
const formatCurrency = (value: number, currency = "IDR", locale = "en-US") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

// Gradient color generators
const EXPENSE_GRADIENTS = [
  { start: "hsl(0, 84%, 60%)", end: "hsl(15, 90%, 55%)" },
  { start: "hsl(15, 90%, 55%)", end: "hsl(30, 95%, 50%)" },
  { start: "hsl(30, 95%, 50%)", end: "hsl(45, 100%, 50%)" },
  { start: "hsl(350, 80%, 55%)", end: "hsl(0, 84%, 60%)" },
  { start: "hsl(20, 85%, 58%)", end: "hsl(35, 92%, 52%)" },
  { start: "hsl(5, 88%, 58%)", end: "hsl(20, 92%, 55%)" },
];

const INCOME_GRADIENTS = [
  { start: "hsl(142, 76%, 45%)", end: "hsl(160, 84%, 39%)" },
  { start: "hsl(160, 84%, 39%)", end: "hsl(180, 80%, 45%)" },
  { start: "hsl(180, 80%, 45%)", end: "hsl(200, 85%, 50%)" },
  { start: "hsl(130, 70%, 50%)", end: "hsl(145, 78%, 42%)" },
  { start: "hsl(165, 82%, 42%)", end: "hsl(185, 78%, 48%)" },
  { start: "hsl(150, 75%, 48%)", end: "hsl(170, 80%, 44%)" },
];

// Custom active shape for hover effect
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
          transition: "all 0.3s ease",
        }}
      />
    </g>
  );
};

// Legend Item Component
const LegendItem = ({
  item,
  index,
  isActive,
  gradientId,
  percentage,
  currency,
  locale,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: DonutChartDataItem;
  index: number;
  isActive: boolean;
  gradientId: string;
  percentage: number;
  currency: string;
  locale: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick?: () => void;
}) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 rounded-lg transition-all duration-300 cursor-pointer",
      isActive ? "bg-accent shadow-sm scale-[1.02]" : "hover:bg-accent/50"
    )}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-3 h-3 rounded-full shadow-sm"
        style={{
          background: `var(--gradient-${gradientId}-${index})`,
        }}
      />
      <span className="text-sm font-medium text-foreground">
        {item.name}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-foreground">
        {formatCurrency(item.value, currency, locale)}
      </span>
      <Badge variant="secondary" className="text-xs font-medium">
        {percentage.toFixed(1)}%
      </Badge>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ type }: { type: "expense" | "income" }) => (
  <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted rounded-xl">
    <PieChartIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
    <p className="text-muted-foreground font-medium mb-2">No data available</p>
    <p className="text-sm text-muted-foreground/70">
      Add your first {type === "expense" ? "expense" : "income"} to see the breakdown
    </p>
  </div>
);

// Quick Stats Component
const QuickStats = ({
  data,
  type,
  currency,
  locale,
}: {
  data: DonutChartDataItem[];
  type: "expense" | "income";
  currency: string;
  locale: string;
}) => {
  const topItem = data[0];
  const Icon = type === "expense" ? TrendingDown : TrendingUp;

  return (
    <div className="grid grid-cols-2 gap-3 mt-4 animate-fade-in">
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={cn(
              "w-3.5 h-3.5",
              type === "expense" ? "text-destructive" : "text-green-500"
            )} />
            <span className="text-xs text-muted-foreground">
              Highest {type === "expense" ? "Expense" : "Income"}
            </span>
          </div>
          <p className="font-bold text-foreground text-sm truncate">
            {topItem?.name || "No data"}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(topItem?.value || 0, currency, locale)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <PieChartIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Categories</span>
          </div>
          <p className="font-bold text-foreground text-sm">{data.length}</p>
          <p className="text-sm text-muted-foreground">
            {type === "expense" ? "Expense" : "Income"} types
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Main DonutChart Component
export const DonutChart = ({
  data,
  title,
  total,
  type = "expense",
  currency = "IDR",
  locale = "en-US",
  className,
  showLegend = true,
  showStats = true,
  onSegmentClick,
}: DonutChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate total and percentages
  const { totalValue, segments } = useMemo(() => {
    const totalValue = total ?? data.reduce((sum, item) => sum + item.value, 0);
    const segments = data.map((item) => ({
      ...item,
      percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
    }));
    return { totalValue, segments };
  }, [data, total]);

  const gradients = type === "expense" ? EXPENSE_GRADIENTS : INCOME_GRADIENTS;
  const gradientId = type === "expense" ? "expense" : "income";

  if (!data || data.length === 0) {
    return <EmptyState type={type} />;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* SVG Gradient Definitions */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {gradients.map((gradient, index) => (
            <linearGradient
              key={`${gradientId}-${index}`}
              id={`gradient-${gradientId}-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={gradient.start} />
              <stop offset="100%" stopColor={gradient.end} />
            </linearGradient>
          ))}
        </defs>
        <style>
          {gradients.map((gradient, index) => `
            :root { --gradient-${gradientId}-${index}: linear-gradient(135deg, ${gradient.start}, ${gradient.end}); }
          `).join('')}
        </style>
      </svg>

      {/* Chart Container */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-52 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
                activeIndex={activeIndex ?? undefined}
                activeShape={renderActiveShape}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => onSegmentClick?.(data[index], index)}
              >
                {segments.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${gradientId}-${index % gradients.length})`}
                    stroke="none"
                    style={{
                      opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                      transition: "opacity 0.3s ease",
                      cursor: onSegmentClick ? "pointer" : "default",
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-muted-foreground font-medium mb-1">
              {title || (type === "expense" ? "Total Expenses" : "Total Income")}
            </span>
            <span className="text-xl font-bold text-foreground">
              {formatCurrency(totalValue, currency, locale)}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 mt-1 pointer-events-auto cursor-help">
                    <span className="text-xs text-muted-foreground">
                      {segments.length} categories
                    </span>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click segments for details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="w-full mt-6 space-y-1">
            {segments.map((item, index) => (
              <LegendItem
                key={item.name}
                item={item}
                index={index % gradients.length}
                isActive={activeIndex === index}
                gradientId={gradientId}
                percentage={item.percentage}
                currency={currency}
                locale={locale}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => onSegmentClick?.(data[index], index)}
              />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {showStats && <QuickStats data={data} type={type} currency={currency} locale={locale} />}
      </div>
    </div>
  );
};

// Swipeable DonutChart Container Component
export interface SwipeableDonutChartProps {
  expenseData: DonutChartDataItem[];
  incomeData: DonutChartDataItem[];
  expenseTotal?: number;
  incomeTotal?: number;
  currency?: string;
  locale?: string;
  className?: string;
}

export const SwipeableDonutChart = ({
  expenseData,
  incomeData,
  expenseTotal,
  incomeTotal,
  currency = "IDR",
  locale = "en-US",
  className,
}: SwipeableDonutChartProps) => {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeTab === "expense") {
      setActiveTab("income");
    }
    if (isRightSwipe && activeTab === "income") {
      setActiveTab("expense");
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {activeTab === "expense" ? "Expenses" : "Income"} Breakdown
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Swipe or use tabs to switch views</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expense" | "income")}>
            <TabsList className="h-9">
              <TabsTrigger
                value="expense"
                className="text-xs px-3 data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive"
              >
                <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                Expenses
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="text-xs px-3 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600"
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Income
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Swipeable Chart Area */}
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{
              transform: `translateX(${activeTab === "expense" ? "0%" : "-100%"})`,
            }}
          >
            {/* Expense Chart */}
            <div className="min-w-full">
              <DonutChart
                data={expenseData}
                total={expenseTotal}
                type="expense"
                currency={currency}
                locale={locale}
              />
            </div>

            {/* Income Chart */}
            <div className="min-w-full">
              <DonutChart
                data={incomeData}
                total={incomeTotal}
                type="income"
                currency={currency}
                locale={locale}
              />
            </div>
          </div>
        </div>

        {/* Swipe Indicator Dots */}
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab("expense")}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              activeTab === "expense"
                ? "w-6 bg-destructive"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label="View expenses"
          />
          <button
            onClick={() => setActiveTab("income")}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              activeTab === "income"
                ? "w-6 bg-green-500"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label="View income"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DonutChart;