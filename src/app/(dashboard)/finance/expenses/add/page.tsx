/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  BanknoteArrowDown,
  Loader2,
  ArrowLeft,
  NotepadText,
} from "lucide-react";
import { DatePicker } from "@/components/finance/expenses/date-picker";
import { CategorySelect } from "@/components/finance/expenses/category-select";
import { PlatformSelect } from "@/components/finance/expenses/platform-select";
import { PaymentSelect } from "@/components/finance/expenses/payment-select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICON_MAP } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { addExpense } from "@/app/action/finance/ActionExpenses";

type BreakdownField = {
  id: string;
  label: string;
  value: string;
};

export default function ExpenseForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("info");
  const router = useRouter();

  // Info State
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Proof State
  const [subtotal, setSubtotal] = React.useState("");
  const [receipt, setReceipt] = React.useState<File | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = React.useState(false);

  const [breakdownFields, setBreakdownFields] = React.useState<
    BreakdownField[]
  >([
    { id: "shipping", label: "Shipping", value: "" },
    { id: "discount", label: "Discount", value: "" },
    { id: "serviceFee", label: "Service Fee", value: "" },
    { id: "additionalFee", label: "Additional Fee", value: "" },
  ]);

  const totalAmount = React.useMemo(() => {
    const base = parseFloat(subtotal) || 0;
    const extra = breakdownFields.reduce((sum, f) => {
      const val = parseFloat(f.value) || 0;
      return f.id === "discount" ? sum - val : sum + val;
    }, 0);
    return base + extra;
  }, [subtotal, breakdownFields]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const updateBreakdownField = (id: string, value: string) => {
    setBreakdownFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  // 👇 FUNGSI SUBMIT YANG SUDAH DIPERBAIKI
  const handleSubmit = async () => {
    if (!title || !category || !subtotal) {
      alert("Mohon isi Nama, Kategori, dan Nominal.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Bungkus data ke dalam FormData
      const formData = new FormData();
      formData.append("name", title);
      formData.append(
        "date",
        date ? date.toISOString() : new Date().toISOString()
      );
      formData.append("category", category);
      formData.append("platform", platform);
      formData.append("paymentMethod", paymentMethod);
      formData.append("subtotal", subtotal);

      // Masukkan breakdown fields (shipping, discount, dll)
      breakdownFields.forEach((field) => {
        if (field.value) {
          formData.append(field.id, field.value);
        }
      });

      // (Opsional) Kirim data Icon agar Notion page punya icon sesuai kategori
      // Server action harus handle parsing JSON string ini
      const iconData = { type: "emoji", emoji: "💸" }; // Default
      // Logic mapping icon simple (bisa dikembangkan)
      formData.append("icon", JSON.stringify(iconData));

      // 2. Panggil Server Action
      const result = await addExpense(formData);

      if (result.success) {
        // 👇 GANTI ALERT DENGAN INI
        toast.success("Transaksi Berhasil Disimpan!", {
          description: `${title} - ${formatCurrency(parseFloat(subtotal))}`,
          duration: 3000,
        });

        router.push("/finance/expenses");
        router.refresh();
      } else {
        // 👇 Error Toast
        toast.error("Gagal menyimpan", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="w-full max-w-md min-h-screen mx-auto flex flex-col relative overflow-hidden shadow-2xl
          bg-background text-foreground"
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="-ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="font-semibold text-sm uppercase tracking-wider opacity-70">
          Add Transaction
        </div>
        <Button variant="ghost" size="icon" className="-mr-2">
          <NotepadText className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Summary Card */}
        <div className="m-4 p-6 rounded-xl border border-border shadow bg-card">
          {/* <h1 className="text-2xl font-semibold mb-2">Add Expenses</h1>
            <p className="text-xs text-muted-foreground mb-6">
              Track your spending efficiently and make informed financial decisions.
            </p> */}

          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            {(() => {
              const IconComp =
                category && ICON_MAP[category]
                  ? ICON_MAP[category]
                  : BanknoteArrowDown;
              return <IconComp className="text-red-500 w-8 h-8" />;
            })()}
          </div>

          <div className="text-center font-semibold">
            {title || "Expense Title"}
          </div>
          <div className="text-center text-sm text-muted-foreground mb-2">
            {date
              ? date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Today"}
          </div>
          <div className="text-center text-3xl font-bold">
            {formatCurrency(totalAmount).replace("Rp", "Rp ")}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col"
        >
          <TabsList className="mx-4 bg-muted h-10 p-1 w-96 xl:w-105 mt-2">
            <TabsTrigger
              value="info"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm dark: dark:data-[state=active]:text-red-400 dark:data-[state=active]:shadow-none"
            >
              Informations
            </TabsTrigger>
            <TabsTrigger
              value="proof"
              className="flex-1 data-[state=active]:bg-white data-[state=active]:text-red-600 data-[state=active]:shadow-sm dark: dark:data-[state=active]:text-red-400 dark:data-[state=active]:shadow-none"
            >
              Expense Details
            </TabsTrigger>
          </TabsList>

          {/* INFO TAB */}
          <TabsContent
            value="info"
            className="m-4 mt-4 p-6 rounded-xl border border-border bg-card space-y-4 shadow-sm"
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expense Name</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nasi Padang Sederhana"
                className="focus-visible:ring-red-500/20 focus-visible:border-red-500"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Date</Label>
              <DatePicker date={date} onChange={setDate} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Platform / Store</label>
              <PlatformSelect value={platform} onChange={setPlatform} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Payment Method</label>
              <PaymentSelect
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
          </TabsContent>

          {/* PROOF TAB */}
          <TabsContent
            value="proof"
            className="m-4 mt-4 p-6 rounded-xl border border-border bg-card space-y-4 shadow-sm"
          >
            {/* Subtotal */}
            <div>
              <label className="text-sm font-medium">Subtotal</label>
              <Input
                type="number"
                inputMode="numeric"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Expense Breakdown */}
            <div>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsBreakdownOpen((v) => !v)}
              >
                Expense breakdown
                {isBreakdownOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </Button>

              {isBreakdownOpen && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {breakdownFields.map((field) => (
                      <div key={field.id}>
                        <label className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </label>
                        <Input
                          type="number"
                          inputMode="numeric"
                          value={field.value}
                          onChange={(e) =>
                            updateBreakdownField(field.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>

                  <label
                    className="flex items-center justify-center gap-2 rounded-lg p-4 cursor-pointer text-sm
                                      border-2 border-dashed border-border text-muted-foreground hover:bg-muted transition"
                  >
                    <Upload size={18} />
                    {receipt ? receipt.name : "Upload receipt"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
        <Button
          className="w-full h-12 text-base font-semibold shadow-lg shadow-red-500/20 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all active:scale-[0.98]"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={18} /> Updating...
            </span>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
