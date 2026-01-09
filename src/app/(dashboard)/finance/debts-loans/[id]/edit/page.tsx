"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Check, X, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/finance/expenses/date-picker";
import { MoneyInput } from "@/components/MoneyInput";
import { getDebtById, updateDebtOrLoan } from "@/app/action/finance/debtsAction"; // Cek typo path

// Status Badge Component
const StatusOption = ({ label, value, current, onClick, color }: any) => (
    <button 
        onClick={() => onClick(value)}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
            current === value 
            ? `bg-${color}-100 text-${color}-700 border-${color}-200 ring-2 ring-${color}-500/20`
            : "bg-transparent text-muted-foreground border-border hover:bg-muted"
        }`}
    >
        {label}
    </button>
);

export default function EditDebtPageV2({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [name, setName] = React.useState("");
  const [total, setTotal] = React.useState("");
  const [paid, setPaid] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [purpose, setPurpose] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Kalkulasi Progress
  const numTotal = Number(total) || 0;
  const numPaid = Number(paid) || 0;
  const percentage = numTotal > 0 ? Math.min((numPaid / numTotal) * 100, 100) : 0;

  React.useEffect(() => {
    const fetch = async () => {
        const { success, data } = await getDebtById(id);
        if(success && data) {
            setName(data.name);
            setTotal(data.total.toString());
            setPaid(data.paid.toString());
            setStatus(data.status);
            setPurpose(data.purpose);
            setDate(new Date(data.dueDate));
        }
        setIsLoading(false);
    }
    fetch();
  }, [id]);

  const handleUpdate = async () => {
    if (!name || !total) return toast.warning("Data belum lengkap");
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("total", total);
    formData.append("paid", paid);
    formData.append("date", date ? date.toISOString() : new Date().toISOString());
    formData.append("status", status);
    formData.append("purpose", purpose);

    const res = await updateDebtOrLoan(id, formData);
    if (res.success) {
      toast.success("Updated!");
      router.back();
      router.refresh();
    } else {
      toast.error("Error updating");
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-zinc-400" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-24 selection:bg-orange-100">
      
      {/* 1. TOP NAV (Minimal) */}
      <div className="flex items-center justify-between px-6 py-6 sticky top-0 bg-zinc-50/80 backdrop-blur-sm z-20">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-zinc-200 transition-colors">
          <X className="w-6 h-6 text-zinc-500" />
        </button>
        <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">EDITING</span>
        <div className="w-10" />
      </div>

      <div className="px-6 max-w-md mx-auto">
        
        {/* 2. HERO INPUT (Big Numbers) */}
        <div className="flex flex-col items-center mb-8">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Amount</label>
            <div className="relative w-full">
                {/* Custom Money Input Style */}
                <MoneyInput 
                    value={total} 
                    onValueChange={setTotal} 
                    className="w-full text-center text-4xl sm:text-5xl font-extrabold bg-transparent border-none shadow-none focus-visible:ring-0 p-0 placeholder:text-zinc-200" 
                    placeholder="0"
                />
            </div>
            
            {/* Title Input as Subtitle */}
            <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                placeholder="What is this for?"
                className="mt-2 text-center text-lg font-medium text-zinc-600 bg-transparent outline-none placeholder:text-zinc-300 w-full"
            />
        </div>

        {/* 3. PROGRESS & PAID INPUT */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 mb-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-zinc-900">Paid so far</span>
                <div className="w-32">
                    <MoneyInput 
                        value={paid} 
                        onValueChange={setPaid} 
                        className="text-right font-bold bg-zinc-50 border-transparent focus:bg-white focus:border-zinc-200 h-9" 
                    />
                </div>
            </div>
            
            {/* Visual Progress Bar */}
            <div className="h-4 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                <div 
                    className={`h-full transition-all duration-1000 ease-out ${percentage >= 100 ? 'bg-green-500' : 'bg-orange-500'}`} 
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
            
            {/* Status Selector Pills */}
            <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 block">Status</label>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setStatus("Active")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${status === "Active" ? "bg-zinc-900 text-white border-zinc-900" : "bg-white border-zinc-200 text-zinc-500"}`}
                    >
                        Active
                    </button>
                    <button 
                        onClick={() => setStatus("Ongoing")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${status === "Ongoing" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-white border-zinc-200 text-zinc-500"}`}
                    >
                        Ongoing
                    </button>
                    <button 
                        onClick={() => setStatus("Paid")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${status === "Paid" ? "bg-green-100 text-green-700 border-green-200" : "bg-white border-zinc-200 text-zinc-500"}`}
                    >
                        Paid
                    </button>
                    <button 
                        onClick={() => setStatus("Overdue")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${status === "Overdue" ? "bg-red-100 text-red-700 border-red-200" : "bg-white border-zinc-200 text-zinc-500"}`}
                    >
                        Overdue
                    </button>
                </div>
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Deadline</label>
                    <div className="bg-white rounded-xl border border-zinc-100 p-1 shadow-sm">
                        <DatePicker date={date} onChange={setDate} />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Notes</label>
                    <Input 
                        value={purpose} 
                        onChange={e => setPurpose(e.target.value)} 
                        className="bg-white border-zinc-100 shadow-sm focus-visible:ring-zinc-200"
                        placeholder="Additional details..."
                    />
                </div>
            </div>

        </div>
      </div>

      {/* 5. FLOATING SAVE BUTTON */}
      <div className="fixed bottom-6 left-0 w-full px-6 z-20">
        <Button 
            onClick={handleUpdate} 
            disabled={isSubmitting}
            className="w-full h-14 rounded-[2rem] bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-300/50 text-lg font-medium transition-transform active:scale-95 flex items-center justify-center gap-2 max-w-md mx-auto"
        >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Check className="w-5 h-5" />}
            Save Changes
        </Button>
      </div>

    </div>
  );
}