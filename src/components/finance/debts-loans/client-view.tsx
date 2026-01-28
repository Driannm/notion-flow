"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Landmark,
  User,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircleIcon,
  VerifiedIcon,
  Clock10Icon,
  ActivitySquare,
  Search,
  Filter,
  ArrowUpDown,
  MessageCircle,
  Clock,
  Loader2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DebtItem } from "@/app/action/finance/getDebts";
import { MoneyInput } from "@/components/finance/MoneyInput";
import { recordPayment } from "@/app/action/finance/debtsAction";

interface Props {
  debts: DebtItem[];
  loans: DebtItem[];
}

export default function DebtsClientView({ debts, loans }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("debts");

  // --- FILTER & SORT STATE ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [sortBy, setSortBy] = React.useState("date_asc");

  // --- QUICK PAY STATE ---
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<DebtItem | null>(null);
  const [payAmount, setPayAmount] = React.useState(""); // Input user (string)
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // --- LOGIC QUICK PAY ---
  const handleQuickPay = (item: DebtItem) => {
    setSelectedItem(item);
    // Default isi input dengan sisa hutang (biar cepet kalau mau lunasin)
    setPayAmount(item.remaining.toString());
    setIsPaymentOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedItem || !payAmount) return;

    setIsSubmitting(true);
    const amountToPay = parseFloat(payAmount); // Yang diinput user
    const newTotalPaid = selectedItem.paid + amountToPay; // Total baru di database
    const remainingAfter = selectedItem.total - newTotalPaid;

    // Tentukan status otomatis
    let newStatus = selectedItem.status;
    if (remainingAfter <= 0) newStatus = "Paid";
    else if (selectedItem.status === "Active") newStatus = "Ongoing";

    try {
      const res = await recordPayment(selectedItem.id, newTotalPaid, newStatus);

      if (res.success) {
        toast.success("Pembayaran Tercatat!", {
          description: `Berhasil menambahkan ${formatCurrency(
            amountToPay
          )} ke ${selectedItem.name}`,
          icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
        });
        setIsPaymentOpen(false);
        router.refresh();
      } else {
        toast.error("Gagal mencatat pembayaran");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC WA REMINDER ---
  const copyReminder = (e: React.MouseEvent, item: DebtItem) => {
    e.stopPropagation();
    const text = `Halo ${item.name}, mau mengingatkan ${
      item.purpose ? `soal ${item.purpose}` : "utang kamu"
    } sebesar ${formatCurrency(item.remaining)}. Jatuh tempo tanggal ${
      item.dueDate
    }. Mohon dilunasi ya, terima kasih! 🙏`;

    navigator.clipboard.writeText(text);
    toast.success("Teks Reminder Disalin!");
  };

  // --- FILTERING LOGIC (Sama seperti sebelumnya) ---
  const filteredData = React.useMemo(() => {
    let data = activeTab === "debts" ? debts : loans;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(lower) ||
          item.purpose.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "All") {
      if (statusFilter === "Active") {
        data = data.filter(
          (item) => item.status === "Active" || item.status === "Ongoing"
        );
      } else {
        data = data.filter((item) => item.status === statusFilter);
      }
    }
    return [...data].sort((a, b) => {
      if (sortBy === "amount_desc") return b.remaining - a.remaining;
      if (sortBy === "amount_asc") return a.remaining - b.remaining;
      const dateA = a.dueDateObj
        ? new Date(a.dueDateObj).getTime()
        : 9999999999999;
      const dateB = b.dueDateObj
        ? new Date(b.dueDateObj).getTime()
        : 9999999999999;
      return dateA - dateB;
    });
  }, [activeTab, debts, loans, searchTerm, statusFilter, sortBy]);

  const summary = React.useMemo(() => {
    const data = activeTab === "debts" ? debts : loans;
    const totalRemaining = data.reduce((acc, item) => acc + item.remaining, 0);
    const totalOriginal = data.reduce((acc, item) => acc + item.total, 0);
    const paidTotal = data.reduce((acc, item) => acc + item.paid, 0);
    return { totalRemaining, totalOriginal, paidTotal, count: data.length };
  }, [activeTab, debts, loans]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Overdue":
        return "bg-red-100 text-red-600 border-red-200";
      case "Paid":
        return "bg-green-100 text-green-600 border-green-200";
      case "Ongoing":
        return "bg-blue-100 text-blue-600 border-blue-200";
      default:
        return "bg-amber-100 text-amber-600 border-amber-200";
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Overdue":
        return AlertCircleIcon;
      case "Paid":
        return VerifiedIcon;
      case "Ongoing":
        return Clock10Icon;
      default:
        return ActivitySquare;
    }
  };
  const getIcon = (type: string) => (type === "debt" ? Landmark : User);

  const renderList = () => {
    if (filteredData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
          <Search className="w-12 h-12 mb-2" />
          <p className="text-sm">No records found</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
            }}
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredData.map((item) => {
          const Icon = getIcon(item.type);
          const isPaidOff = item.remaining <= 0;
          const StatusIcon = getStatusIcon(item.status);

          return (
            <div
              key={item.id}
              onClick={() => router.push(`/finance/debts-loans/${item.id}`)}
              className={`p-4 rounded-2xl border bg-card shadow-sm transition-all active:scale-[0.98] cursor-pointer ${
                isPaidOff
                  ? "border-green-200 dark:bg-green-950/20 bg-green-50/30 opacity-80"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      activeTab === "debts"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-blue-500/10 text-blue-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-2 py-0.5 rounded-xl border font-medium flex items-center gap-1 w-fit mt-1 ${getStatusColor(
                        item.status
                      )}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      <span>{item.status}</span>
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Remaining
                  </div>
                  <div
                    className={`font-bold text-sm ${
                      isPaidOff ? "text-green-600" : "text-foreground"
                    }`}
                  >
                    {formatCurrency(item.remaining).replace("Rp", "")}
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5 text-muted-foreground">
                  <span>Paid: {Math.round(item.progress)}%</span>
                  <span>
                    Total: {formatCurrency(item.total).replace("Rp", "")}
                  </span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isPaidOff
                        ? "bg-green-500"
                        : activeTab === "debts"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Due:{" "}
                    <span
                      className={
                        item.status === "Overdue"
                          ? "text-red-500 font-bold"
                          : "text-foreground font-medium"
                      }
                    >
                      {item.dueDate}
                    </span>
                  </span>
                </div>
                <div className="flex gap-2">
                  {activeTab === "loans" && !isPaidOff && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 rounded-full hover:bg-green-100 text-green-600"
                      onClick={(e) => copyReminder(e, item)}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  {!isPaidOff && (
                    // 👇 BUTTON QUICK PAY DIAKTIFKAN
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-3 rounded-full hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickPay(item);
                      }}
                    >
                      Record Payment
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative bg-background text-foreground shadow-2xl overflow-hidden">
      {/* Header & Tabs & Summary & Filter sama seperti sebelumnya */}
      <div className="px-4 py-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="font-semibold text-lg">Debts & Loans</div>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* TABS */}
        <div className="px-4 pt-4">
          <Tabs
            defaultValue="debts"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 h-12 bg-muted p-1 rounded-2xl">
              <TabsTrigger
                value="debts"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm font-medium"
              >
                My Debts
              </TabsTrigger>
              <TabsTrigger
                value="loans"
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
              >
                Loans Given
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* SUMMARY & FILTER COMPONENTS (Kode Lama) */}
        <div className="p-4">
          <div
            className={`p-6 rounded-[1.5rem] text-white shadow-lg transition-colors duration-500 ${
              activeTab === "debts"
                ? "bg-gradient-to-br from-amber-500 to-orange-600"
                : "bg-gradient-to-br from-blue-500 to-indigo-600"
            }`}
          >
            <div className="flex items-center gap-2 mb-4 opacity-90">
              {activeTab === "debts" ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {activeTab === "debts" ? "Total I Owe" : "Total Owed to Me"}
              </span>
            </div>
            <div className="text-3xl font-bold mb-2 tracking-tight">
              {formatCurrency(summary.totalRemaining)}
            </div>
            <div className="text-xs text-white/80 mb-6 flex justify-between">
              <span>{summary.count} active items</span>
              <span>Paid: {formatCurrency(summary.paidTotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-[10px] text-white/70 uppercase mb-1">
                  Next Due
                </div>
                <div className="font-semibold text-sm">Check List</div>
              </div>
              <div className="bg-black/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="text-[10px] text-white/70 uppercase mb-1">
                  Progress
                </div>
                <div className="font-semibold text-sm">
                  {summary.totalOriginal > 0
                    ? Math.round(
                        (summary.paidTotal / summary.totalOriginal) * 100
                      )
                    : 0}
                  % Paid
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="px-4 mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-muted/50 border-transparent focus:bg-white transition-all"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl shrink-0"
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("date_asc")}>
                Due Date (Soonest)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount_desc")}>
                Highest Amount
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("amount_asc")}>
                Lowest Amount
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="px-4 mb-2 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex gap-2">
            {["All", "Active", "Overdue", "Paid"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  statusFilter === status
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* LIST */}
        <div className="px-4 pb-4">
          <h3 className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wider text-[10px]">
            {activeTab === "debts" ? "Payables List" : "Receivables List"}
            {filteredData.length !== summary.count && (
              <span className="ml-1">({filteredData.length})</span>
            )}
          </h3>
          {renderList()}
        </div>
      </div>

      <div className="fixed bottom-6 right-1/2 translate-x-1/2 max-w-md w-full px-4 flex justify-end pointer-events-none z-50">
        <Button
          className={`h-14 w-14 rounded-full shadow-xl pointer-events-auto flex items-center justify-center transition-colors ${
            activeTab === "debts"
              ? "bg-amber-500 hover:bg-amber-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={() =>
            router.push(
              `/finance/debts-loans/add?type=${
                activeTab === "debts" ? "debt" : "loan"
              }`
            )
          }
        >
          <Plus className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* 👇 MODAL QUICK PAY DI SINI */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="w-[90%] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Record Payment
            </DialogTitle>
            <DialogDescription>
              Enter the amount you want to pay for <b>{selectedItem?.name}</b>.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount to Pay</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  Rp
                </span>
                <MoneyInput
                  id="amount"
                  value={payAmount}
                  onValueChange={setPayAmount}
                  className="text-lg font-semibold"
                  placeholder="0"
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                Remaining:{" "}
                {selectedItem ? formatCurrency(selectedItem.remaining) : 0}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitPayment}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
