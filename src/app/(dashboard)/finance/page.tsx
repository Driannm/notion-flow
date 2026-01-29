'use client'

import { Bell, ChevronDown, TrendingUp, TrendingDown, Info, Sparkles, Repeat, Clock, Plus, Home, FileText, Calendar, Settings, DollarSign, CreditCard, ArrowLeftRight, WalletCards } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { getFinancialInsights } from "@/app/action/finance/getInsights";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Format helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardPage() {
  const [insightsData, setInsightsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { success, data } = await getFinancialInsights();
        if (success) {
          setInsightsData(data);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Data dari Notion
  const expenseData = insightsData?.expense || { totalCurrent: 0, totalLast: 0, percent: 0, topCategories: [] };
  const incomeData = insightsData?.income || { totalCurrent: 0, totalLast: 0, percent: 0, topCategories: [] };
  const debtData = insightsData?.debt || { totalRemaining: 0, count: 0 };
  const loanData = insightsData?.loan || { totalRemaining: 0, count: 0 };
  const netFlowData = insightsData?.netFlow || 0;

  const isPositiveFlow = netFlowData >= 0;

  // Hitung persentase budget terpakai
  const budgetUsedPercent = incomeData.totalCurrent > 0 
    ? Math.min((expenseData.totalCurrent / incomeData.totalCurrent) * 100, 100) 
    : 0;

  // Current balance
  const currentBalance = incomeData.totalCurrent - expenseData.totalCurrent + 87000;

  const transactions = [
    {
      id: 1,
      merchant: expenseData.topCategories[0]?.name || 'Food & Dining',
      icon: '🍽️',
      iconBg: 'bg-purple-100',
      tags: ['Daily'],
      amount: `-${formatCurrency(expenseData.topCategories[0]?.value || 354.25)}`,
      amountColor: 'text-red-500',
      secondary: ''
    },
    {
      id: 2,
      merchant: 'Salary Deposit',
      icon: '💰',
      iconBg: 'bg-green-100',
      tags: ['Income'],
      amount: `+${formatCurrency(incomeData.totalCurrent || 4875)}`,
      amountColor: 'text-green-500',
      secondary: 'Monthly'
    }
  ]

  const navItems = [
    { 
      icon: TrendingUp, 
      label: 'Income', 
      active: false,
      href: '/finance/income'
    },
    { 
      icon: DollarSign, 
      label: 'Loan', 
      active: false,
      href: '/finance/debts-loans?type=loan'
    },
    { icon: null, label: '', active: false },
    { 
      icon: CreditCard, 
      label: 'Debt', 
      active: false,
      href: '/finance/debts-loans?type=debt'
    },
    { 
      icon: TrendingDown, 
      label: 'Expense', 
      active: false,
      href: '/finance/expenses'
    }
  ]

  const summaryCards = [
    {
      id: 1,
      title: 'Income',
      icon: TrendingUp,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      amount: formatCurrency(incomeData.totalCurrent),
      info: 'Monthly income',
      change: incomeData.percent
    },
    {
      id: 2,
      title: 'Expenses',
      icon: TrendingDown,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      amount: formatCurrency(expenseData.totalCurrent),
      info: 'Monthly expenses',
      change: expenseData.percent
    },
    {
      id: 3,
      title: 'Loan',
      icon: DollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      amount: formatCurrency(loanData.totalRemaining),
      info: 'Active loans',
      count: loanData.count
    },
    {
      id: 4,
      title: 'Debt',
      icon: CreditCard,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      amount: formatCurrency(debtData.totalRemaining),
      info: 'Total debt',
      count: debtData.count
    }
  ]

  const [activeCardIndex, setActiveCardIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft
      const cardWidth = 176 // Lebar card + gap
      const index = Math.round(scrollLeft / cardWidth)
      setActiveCardIndex(Math.min(index, summaryCards.length - 2))
    }
  }

  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 176
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      })
      setActiveCardIndex(index)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center bg-gray-50 items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      {/* Container utama dengan layout */}
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Konten Halaman */}
        <main className="flex-1 scroll-smooth pb-24">
          <div className="relative">
            {/* Header Balance */}
            <div className="relative bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 pt-12 pb-32 shadow-xl">
              {/* Top Row */}
              <div className="flex items-center justify-between mb-8 px-6">
                <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-full h-full" />
                </div>
                
                <button className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium hover:bg-white/30 transition-all">
                  <span>November 2025</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <button className="relative p-2 hover:bg-white/10 rounded-full transition-all">
                  <Bell className="w-6 h-6 text-white" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-purple-500"></span>
                </button>
              </div>

              {/* Balance Content */}
              <div className="text-center space-y-3 px-6">
                <p className="text-white/80 text-sm font-medium tracking-wide">Current Balance</p>
                <h1 className="text-white text-5xl font-bold tracking-tight">{formatCurrency(currentBalance)}</h1>
                <div className="flex justify-center">
                  <div className={`bg-white/20 backdrop-blur-sm border-0 px-4 py-1.5 font-medium text-xs rounded-full ${
                    netFlowData >= 0 ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {netFlowData >= 0 ? '+' : ''}{formatCurrency(netFlowData)} this month
                  </div>
                </div>
              </div>

              {/* Curved Wave Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24">
                <svg viewBox="0 0 390 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
                  <path d="M 0,48 Q 97.5,0 195,48 T 390,48 L 390,96 L 0,96 Z" fill="white" />
                </svg>
              </div>
            </div>

            <div className="px-4 space-y-4 -mt-20 relative z-10">
              {/* Money Summary */}
              <div className="bg-white rounded-3xl shadow-lg border-0 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">Your Money</h2>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <button className="text-sm font-medium text-gray-600 h-8 px-3 rounded-full hover:bg-gray-100 flex items-center gap-1">
                    <span>Details</span>
                    <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                  </button>
                </div>

                {/* Scrollable Cards Container */}
                <div className="relative">
                  {/* Scrollable Cards */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
                    onScroll={handleScroll}
                  >
                    {summaryCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <div 
                          key={card.id}
                          className="bg-white rounded-2xl border-0 p-4 text-center min-w-[160px] flex-shrink-0 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="space-y-2">
                            <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center mx-auto`}>
                              <Icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 font-medium mb-1 flex items-center justify-center gap-1">
                                {card.title}
                                <Info className="w-3 h-3 text-gray-400" />
                              </p>
                              <p className="text-xl font-bold text-gray-900">{card.amount}</p>
                              {(card.change !== undefined || card.count !== undefined) && (
                                <p className="text-xs mt-1">
                                  {card.change !== undefined && (
                                    <span className={card.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                                      {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change).toFixed(1)}%
                                    </span>
                                  )}
                                  {card.count !== undefined && (
                                    <span className="text-gray-500">
                                      {card.count} active
                                    </span>
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Scroll Indicators */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {Array.from({ length: summaryCards.length - 1 }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeCardIndex === index 
                            ? 'w-6 bg-gray-800' 
                            : 'bg-gray-300'
                        }`}
                        aria-label={`Go to card ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Insight Banner */}
              <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-0 p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-white font-medium text-sm">
                      {budgetUsedPercent <= 80 
                        ? "You're on track with your budget! 🎉" 
                        : "Consider reviewing your spending"}
                    </p>
                  </div>
                  <button className="bg-white/20 hover:bg-white/30 text-white border-0 h-8 px-4 rounded-full text-xs font-semibold backdrop-blur-sm transition-all">
                    View Details
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-4 pb-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                    <p className="text-xs text-gray-500 mt-1">Monday, 12 January, 2026</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Repeat className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Period Button and Total */}
                <div className="flex items-center justify-between">
                  <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-0 h-8 px-4 rounded-full text-xs font-semibold">
                    This Month
                  </button>
                  <p className="text-sm text-gray-600">
                    Net Flow <span className={`font-bold ${netFlowData >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {netFlowData >= 0 ? '+' : ''}{formatCurrency(netFlowData)}
                    </span>
                  </p>
                </div>

                {/* Transaction Items */}
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 ${transaction.iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
                          {transaction.icon}
                        </div>

                        {/* Middle Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm mb-1.5">{transaction.merchant}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {transaction.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="bg-gray-50 text-gray-600 text-xs px-2.5 py-0.5 font-medium border-0 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Right Amount */}
                        <div className="text-right flex-shrink-0">
                          <p className={`font-bold text-sm ${transaction.amountColor}`}>{transaction.amount}</p>
                          {transaction.secondary && (
                            <p className="text-xs text-gray-400 mt-0.5">{transaction.secondary}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 z-30">
          {/* Floating Action Button - Middle */}
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-40">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="group w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-full shadow-2xl shadow-purple-300/50 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-4 border-white">
                  <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={10}
                className="w-48 rounded-2xl p-2 bg-white border-gray-200 shadow-xl"
              >
                <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wider px-2">
                  Add Transaction
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />

                <Link href="/finance/expenses/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-red-50 focus:text-red-600">
                    <TrendingDown className="w-4 h-4 text-red-500" />
                    <span>Add Expense</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/finance/income/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-green-50 focus:text-green-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Add Income</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/finance/transfer/add">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-blue-50 focus:text-blue-600">
                    <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                    <span>Add Transfer</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/finance/debts-loans/add?type=debt">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-amber-50 focus:text-amber-600">
                    <WalletCards className="w-4 h-4 text-amber-500" />
                    <span>Add Debt</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/finance/debts-loans/add?type=loan">
                  <DropdownMenuItem className="gap-2 cursor-pointer py-2.5 rounded-xl focus:bg-blue-50 focus:text-blue-600">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Add Loan</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center justify-between px-6 py-3">
            {navItems.map((item, index) => {
              if (!item.icon) {
                return <div key={index} className="w-14"></div>
              }
              
              const Icon = item.icon
              return (
                <Link
                  key={index}
                  href={item.href || '#'}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    item.active 
                      ? 'text-purple-600' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}