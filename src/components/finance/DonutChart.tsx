/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from "recharts";
import type { PieProps } from "recharts";

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


// 🔥 FIX RECHARTS TYPE GAP
type PieWithActiveProps = PieProps & {
  activeIndex?: number;
  activeShape?: (props: any) => React.ReactNode;
};

const PieFixed = Pie as unknown as React.FC<PieWithActiveProps>;


// ================= TYPES =================
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


// ================= HELPERS =================
const formatCurrency = (value: number, currency = "IDR", locale = "en-US") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);


// ================= COLORS =================
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


// ================= ACTIVE SLICE =================
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

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
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.15))",
          transition: "all 0.3s ease",
        }}
      />
    </g>
  );
};


// ================= MAIN DONUT =================
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
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

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

  if (!data?.length) {
    return <div>No data</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Gradients */}
      <svg width="0" height="0" className="absolute">
        <defs>
          {gradients.map((gradient, index) => (
            <linearGradient
              key={`${gradientId}-${index}`}
              id={`gradient-${gradientId}-${index}`}
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor={gradient.start} />
              <stop offset="100%" stopColor={gradient.end} />
            </linearGradient>
          ))}
        </defs>
      </svg>

      <div className="relative w-52 h-52 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <PieFixed
              data={segments}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_: any, index: number) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              onClick={(_: any, index: number) => onSegmentClick?.(data[index], index)}
            >
              {segments.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${gradientId}-${index % gradients.length})`}
                  style={{
                    opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.4,
                    transition: "opacity 0.3s ease",
                    cursor: onSegmentClick ? "pointer" : "default",
                  }}
                />
              ))}
            </PieFixed>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground">
            {title || (type === "expense" ? "Total Expenses" : "Total Income")}
          </span>
          <span className="text-xl font-bold">
            {formatCurrency(totalValue, currency, locale)}
          </span>
        </div>
      </div>
    </div>
  );
};


export default DonutChart;