/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Upload,
  Pencil, // Icon beda dikit untuk Edit
  Loader2,
  Trash2,
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

// Import Actions
import { getExpenseById } from "@/app/action/finance/getExpenses";
import { updateExpense } from "@/app/action/finance/updateExpenses";

type BreakdownField = {
  id: string;
  label: string;
  value: string;
};

// Next.js 15: Params is Promise
export default function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap params (React.use() logic for Next 15 client components)
  const { id } = React.use(params);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("info");

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

  const [breakdownFields, setBreakdownFields] = React.useState<BreakdownField[]>([
    { id: "shipping", label: "Shipping", value: "" },
    { id: "discount", label: "Discount", value: "" },
    { id: "serviceFee", label: "Service Fee", value: "" },
    { id: "additionalFee", label: "Additional Fee", value: "" },
  ]);

  // 1. Fetch Data saat halaman dimuat
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { success, data } = await getExpenseById(id);
        if (success && data) {
          setTitle(data.title);
          setCategory(data.category);
          setPlatform(data.platform !== "-" ? data.platform : "");
          setPaymentMethod(data.paymentMethod);
          
          // Parse Date (Format: "Monday, 25 October 2023" -> Date Object)
          // Karena getExpenseById mengembalikan formatted date string, 
          // idealnya server mengembalikan raw ISO string juga. 
          // Tapi disini kita coba parse manual atau set default today jika gagal.
          // *Saran: Update getExpenseById untuk return rawDate ISO string*
          // Untuk sekarang kita set default today jika parsing ribet, 
          // atau asumsikan user akan set ulang jika salah.
          setDate(new Date()); 

          // Isi nominal
          setSubtotal(data.subtotal ? data.subtotal.toString() : data.amount.toString());
          
          // Isi breakdown jika ada
          setBreakdownFields(prev => prev.map(field => {
             if (field.id === "shipping" && data.fee) return { ...field, value: data.fee.toString() }; // Simplifikasi fee gabungan
             if (field.id === "discount" && data.discount) return { ...field, value: data.discount.toString() };
             return field;
          }));
        } else {
            toast.error("Data tidak ditemukan");
            router.push("/finance/expenses");
        }
      } catch (error) {
        console.error(error);
        toast.error("Gagal mengambil data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, router]);


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

  const handleUpdate = async () => {
    if (!title || !category || !subtotal) {
      toast.warning("Mohon lengkapi data utama");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", title);
      formData.append("date", date ? date.toISOString() : new Date().toISOString());
      formData.append("category", category);
      formData.append("platform", platform);
      formData.append("paymentMethod", paymentMethod);
      formData.append("subtotal", subtotal);

      breakdownFields.forEach((field) => {
        if (field.value) formData.append(field.id, field.value);
      });

      // Panggil Server Action UPDATE
      const result = await updateExpense(id, formData);

      if (result.success) {
        toast.success("Perubahan Disimpan!", {
          description: `${title} berhasil diperbarui.`,
        });
        router.push("/finance/expenses");
        router.refresh();
      } else {
        toast.error("Gagal update", { description: result.message });
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col relative overflow-hidden shadow-2xl bg-background text-foreground">
      
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>
        <span className="text-sm font-semibold opacity-70 uppercase tracking-wider">Edit Transaction</span>
        <div className="w-8" /> {/* Spacer biar title tengah */}
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Summary Card (Theme: Amber/Edit) */}
        <div className="m-4 p-6 rounded-xl border border-amber-200 shadow-sm bg-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Pencil className="w-24 h-24 text-amber-500" />
          </div>

          <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            {(() => {
                const IconComp = category && ICON_MAP[category] ? ICON_MAP[category] : Pencil;
                return <IconComp className="text-amber-500 w-8 h-8" />;
            })()}
          </div>

          <div className="text-center font-medium text-lg truncate px-4">
            {title || "Untitled Expense"}
          </div>
          <div className="text-center text-xs text-muted-foreground mb-2">
            {date ? date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Today"}
          </div>
          <div className="text-center text-3xl font-bold text-amber-600 tracking-tight">
            {formatCurrency(totalAmount).replace("Rp", "Rp ")}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col">
          <TabsList className="mx-4 bg-muted h-10 p-1">
            <TabsTrigger 
                value="info" 
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
            >
              Info
            </TabsTrigger>
            <TabsTrigger 
                value="proof" 
                className="flex-1 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm"
            >
              Amount
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
                  className="focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
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
                <PaymentSelect value={paymentMethod} onChange={setPaymentMethod} />
              </div>
          </TabsContent>

          {/* PROOF TAB */}
          <TabsContent
            value="proof"
            className="m-4 mt-4 p-6 rounded-xl border border-border bg-card space-y-4 shadow-sm"
          >
              {/* Subtotal */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Total / Subtotal</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                    <Input
                        type="number"
                        inputMode="numeric"
                        value={subtotal}
                        onChange={(e) => setSubtotal(e.target.value)}
                        placeholder="0"
                        className="pl-9 focus-visible:ring-amber-500/20 focus-visible:border-amber-500"
                    />
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200 transition-all"
                  onClick={() => setIsBreakdownOpen((v) => !v)}
                >
                  <span className="text-xs">Advanced Breakdown</span>
                  {isBreakdownOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </Button>

                {isBreakdownOpen && (
                  <div className="mt-4 space-y-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="grid grid-cols-2 gap-4">
                      {breakdownFields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                            {field.label}
                          </label>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) => updateBreakdownField(field.id, e.target.value)}
                            className="h-9 text-xs focus-visible:ring-amber-500/20"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Receipt (Optional di Edit, mungkin hanya display name) */}
                <div className="mt-4">
                    <label className={`flex flex-col items-center justify-center gap-2 rounded-xl p-6 cursor-pointer text-sm border-2 border-dashed transition-all duration-300 ${receipt ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border text-muted-foreground hover:bg-amber-50/50 hover:border-amber-300 hover:text-amber-600"}`}>
                        {receipt ? (
                            <>
                                <Upload className="w-8 h-8" />
                                <span className="font-medium truncate max-w-[200px]">{receipt.name}</span>
                                <span className="text-xs opacity-70">New file selected</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-6 h-6 mb-1 opacity-50" />
                                <span className="font-medium">Update Receipt</span>
                                <span className="text-xs opacity-50">Upload to replace existing</span>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                        />
                    </label>
                </div>
              </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
        <Button
          className="w-full h-12 text-base font-semibold shadow-lg shadow-amber-500/20 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all active:scale-[0.98]"
          onClick={handleUpdate}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
             <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Updating...</span>
          ) : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}