"use client";

import * as React from "react";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  ArrowRight,
  Calendar,
  PieChart,
  Settings,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FinanceDashboard() {
  const [currentMonth] = React.useState(() => {
    return new Date().toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  });

  // Mock data - ganti dengan real data nanti
  const stats = {
    totalExpenses: 4250000,
    totalIncome: 8500000,
    totalDebts: 2100000,
    balance: 2150000,
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const modules = [
    {
      id: "expenses",
      title: "Expenses Tracker",
      description: "Track your daily spending and expenses",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      value: stats.totalExpenses,
      href: "/finance/expenses",
    },
    {
      id: "income",
      title: "Income Tracker",
      description: "Monitor your income sources",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      value: stats.totalIncome,
      href: "/finance/income",
    },
    {
      id: "debts",
      title: "Debts & Loan Tracker",
      description: "Manage your debts and loan payments",
      icon: CreditCard,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      value: stats.totalDebts,
      href: "/finance/debts-loans",
    },
  ];
 
  const quickActions = [
    { label: "Add Expense", icon: TrendingDown, href: "/finance/expenses/add" },
    { label: "Add Income", icon: TrendingUp, href: "/finance/income/add" },
    { label: "Add Debt", icon: CreditCard, href: "/finance/debts/add" },
  ];

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative overflow-hidden shadow-2xl bg-background text-foreground">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold">Finance</h1>
            <p className="text-xs text-muted-foreground">
              Manage your financial life
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Balance Overview Card */}
        <div className="m-4 p-6 rounded-xl border border-border shadow bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Current Balance
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatCurrency(stats.balance)}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{currentMonth}</span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Income</div>
              <div className="text-sm font-semibold text-green-600">
                {formatCurrency(stats.totalIncome).replace("Rp", "")}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Expenses</div>
              <div className="text-sm font-semibold text-red-600">
                {formatCurrency(stats.totalExpenses).replace("Rp", "")}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Debts</div>
              <div className="text-sm font-semibold text-orange-600">
                {formatCurrency(stats.totalDebts).replace("Rp", "")}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors"
                onClick={() => (window.location.href = action.href)}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-xs font-medium text-center">
                  {action.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Modules */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
            Finance Modules
          </h2>
          <div className="space-y-3">
            {modules.map((module) => (
              <div
                key={module.id}
                className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors cursor-pointer shadow"
                onClick={() => (window.location.href = module.href)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 ${module.bgColor} rounded-xl flex items-center justify-center shrink-0`}
                  >
                    <module.icon className={`w-6 h-6 ${module.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{module.title}</h3>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {module.description}
                    </p>
                    <div className="text-lg font-bold">
                      {formatCurrency(module.value)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights Card */}
        <div className="mx-4 mb-4 p-4 rounded-xl border border-border bg-card shadow">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Financial Insights</h3>
              <p className="text-xs text-muted-foreground mb-3">
                View detailed analytics and reports about your financial health
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Insights
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation / FAB */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t z-50">
        <div className="max-w-md mx-auto">
          <Button className="w-full rounded-xl shadow-lg" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>
    </div>
  );
}