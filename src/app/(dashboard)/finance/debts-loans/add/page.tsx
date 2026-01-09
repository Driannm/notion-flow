"use client";

import * as React from "react";
import { Suspense } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/finance/expenses/date-picker";
import { MoneyInput } from "@/components/MoneyInput"; // 👈 Pastikan path ini
import { addDebtOrLoan } from "@/app/action/finance/debtsAction"; // 👈 Cek nama file (Actions vs Action)

function AddDebtForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "debt" | "loan") || "debt";

  const isDebt = type === "debt";
  
  // Tema Warna Dinamis (Amber untuk Hutang, Blue untuk Piutang)
  const themeText = isDebt ? "text-amber-600" : "text-blue-600";
  const themeBg = isDebt ? "bg-amber-500" : "bg-blue-500";
  const themeLight = isDebt ? "bg-amber-50" : "bg-blue-50";
  const themeBorder = isDebt ? "border-amber-200" : "border-blue-200";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form State
  const [name, setName] = React.useState("");
  const [total, setTotal] = React.useState("");
  const [paid, setPaid] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [purpose, setPurpose] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Kalkulasi Progress Visual
  const numTotal = Number(total) || 0;
  const numPaid = Number(paid) || 0;
  const percentage = numTotal > 0 ? Math.min((numPaid / numTotal) * 100, 100) : 0;

  const handleSubmit = async () => {
    if (!name || !total) {
      toast.warning("Mohon isi Nama dan Jumlah Total.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("total", total);
    formData.append("paid", paid || "0");
    formData.append("date", date ? date.toISOString() : new Date().toISOString());
    formData.append("status", status);
    formData.append("purpose", purpose);

    const res = await addDebtOrLoan(formData, type);

    if (res.success) {
      toast.success("Berhasil disimpan!");
      router.push("/finance/debts");
      router.refresh();
    } else {
      toast.error("Gagal menyimpan", { description: res.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24 selection:bg-zinc-200">
      
      {/* 1. TOP NAV (Minimal) */}
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-zinc-50/80 backdrop-blur-sm z-20">
        <button 
          onClick={() => router.back()} 
          className="p-2 -ml-2 rounded-full hover:bg-zinc-200 transition-colors"
        >
          <X className="w-6 h-6 text-zinc-500" />
        </button>
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
          NEW {isDebt ? "DEBT" : "LOAN"}
        </span>
        <div className="w-10" />
      </div>

      <div className="px-6 max-w-md mx-auto">
        
        {/* 2. HERO INPUT (Big Numbers) */}
        <div className="flex flex-col items-center mb-8">
            <label className={`text-xs font-bold uppercase tracking-widest mb-2 ${themeText}`}>
              Total Amount
            </label>
            <div className="relative w-full">
                <MoneyInput 
                    value={total} 
                    onValueChange={setTotal} 
                    className="w-full text-center text-4xl sm:text-5xl font-extrabold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-zinc-200 text-zinc-900" 
                    placeholder="0"
                    autoFocus // Otomatis fokus saat buka halaman
                />
            </div>
            
            {/* Name Input */}
            <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder={isDebt ? "What is this debt for?" : "Who are you lending to?"}
                className="mt-4 text-center text-lg font-medium text-zinc-600 bg-transparent outline-none placeholder:text-zinc-300 w-full border-b border-transparent focus:border-zinc-200 pb-1 transition-colors"
            />
        </div>

        {/* 3. INITIAL PAYMENT (Optional) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-zinc-900">Paid Upfront?</span>
                <div className="w-32">
                    <MoneyInput 
                        value={paid} 
                        onValueChange={setPaid} 
                        className="text-right font-bold bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 h-9"
                        placeholder="0" 
                    />
                </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${themeBg}`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-medium text-zinc-400">
                <span>0%</span>
                <span>{Math.round(percentage)}% Paid</span>
            </div>
        </div>

        {/* 4. DETAILS GRID */}
        <div className="space-y-6">
            
            {/* Status Pills */}
            <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">
                  Initial Status
                </label>
                <div className="flex flex-wrap gap-2">
                    {["Active", "Ongoing", "Paid"].map((s) => (
                        <button 
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                                status === s 
                                ? "bg-zinc-900 text-white border-zinc-900 shadow-md transform scale-105" 
                                : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Due Date
                    </label>
                    <div className="bg-white rounded-xl border border-zinc-100 p-1 shadow-sm">
                        <DatePicker date={date} onChange={setDate} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Notes
                    </label>
                    <Input 
                        value={purpose} 
                        onChange={e => setPurpose(e.target.value)} 
                        className="bg-white border-zinc-100 shadow-sm focus-visible:ring-zinc-200 h-12"
                        placeholder="Additional details..."
                    />
                </div>
            </div>

        </div>
      </div>

      {/* 5. FLOATING SAVE BUTTON */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-20">
        <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full h-14 rounded-[2rem] bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-300/50 text-lg font-medium transition-transform active:scale-95 flex items-center justify-center gap-2 max-w-md mx-auto"
        >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check className="w-5 h-5" />}
            Save Record
        </Button>
      </div>

    </div>
  );
}

// Export dengan Suspense (Wajib untuk useSearchParams)
export default function AddDebtPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-400" /></div>}>
      <AddDebtForm />
    </Suspense>
  );
}