"use client";

import * as React from "react";
import { Suspense } from "react"; // 👈 1. Import Suspense
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/finance/expenses/date-picker";
import { addDebtOrLoan } from "@/app/action/finance/debtsAction";
import { MoneyInput } from "@/components/MoneyInput"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 👇 2. Pisahkan Logic Form ke Component Sendiri
function AddDebtForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 👈 useSearchParams aman di sini
  const type = (searchParams.get("type") as "debt" | "loan") || "debt";

  const isDebt = type === "debt";
  const themeColor = isDebt ? "text-amber-600" : "text-blue-600";
  const bgTheme = isDebt ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600";
  const ringTheme = isDebt ? "focus-visible:ring-amber-500" : "focus-visible:ring-blue-500";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  // Form State
  const [name, setName] = React.useState("");
  const [total, setTotal] = React.useState("");
  const [paid, setPaid] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [purpose, setPurpose] = React.useState("");

  const handleSubmit = async () => {
    if (!name || !total) {
      toast.warning("Nama dan Jumlah Total wajib diisi.");
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
      router.push("/finance/debts"); // Sesuaikan jika path folder kamu 'debts-loans'
      router.refresh();
    } else {
      toast.error("Gagal menyimpan", { description: res.message });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-background text-foreground relative">
      
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center gap-2 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className={`flex items-center gap-1 transition ${themeColor}`}>
          <ChevronLeft size={20} />
          <span className="font-medium text-sm">Cancel</span>
        </button>
        <span className="flex-1 text-center font-semibold text-sm uppercase tracking-wide opacity-70">
          New {isDebt ? "Debt" : "Loan"}
        </span>
        <div className="w-16" /> 
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto pb-24">
        <div className="space-y-2">
            <label className={`text-xs font-bold uppercase tracking-widest ${themeColor}`}>Total Amount</label>
            <MoneyInput 
                value={total} 
                onValueChange={setTotal}
                className={`text-2xl font-bold border-0 border-b rounded-none px-0 pl-8 focus-visible:ring-0 ${isDebt ? 'border-amber-200 focus:border-amber-500' : 'border-blue-200 focus:border-blue-500'} bg-transparent`}
            />
        </div>

        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Name / Title</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={isDebt ? "e.g. Cicilan Motor" : "e.g. Pinjam ke Budi"} className={`focus-visible:ring-1 ${ringTheme}`} />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Due Date</label>
                <DatePicker date={date} onChange={setDate} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Already Paid</label>
                    <MoneyInput value={paid} onValueChange={setPaid} className={`focus-visible:ring-1 ${ringTheme}`} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className={`focus:ring-1 ${ringTheme}`}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Ongoing">Ongoing</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                            <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes / Purpose</label>
                <Input value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Optional note..." className={`focus-visible:ring-1 ${ringTheme}`} />
            </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
        <Button className={`w-full h-12 rounded-xl text-white shadow-lg ${bgTheme}`} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Record</>}
        </Button>
      </div>
    </div>
  );
}

// 👇 3. Export Page Utama dengan Suspense Boundary
export default function AddDebtPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
      <AddDebtForm />
    </Suspense>
  );
}