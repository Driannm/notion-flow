"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/finance/expenses/date-picker";
import { getDebtById, updateDebtOrLoan } from "@/app/action/finance/debtsAction";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function EditDebtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Form Data
  const [name, setName] = React.useState("");
  const [total, setTotal] = React.useState("");
  const [paid, setPaid] = React.useState("");
  const [status, setStatus] = React.useState("Active");
  const [purpose, setPurpose] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Fetch Data
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
        } else {
            toast.error("Data not found");
            router.back();
        }
        setIsLoading(false);
    }
    fetch();
  }, [id, router]);

  const handleUpdate = async () => {
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
      toast.success("Updated successfully!");
      router.back();
      router.refresh();
    } else {
      toast.error("Failed to update");
    }
    setIsSubmitting(false);
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-background text-foreground relative">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ChevronLeft size={20} /> Back
        </button>
        <span className="text-sm font-semibold uppercase tracking-wide">Edit Record</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Debt/Loan</label>
            <Input type="number" value={total} onChange={e => setTotal(e.target.value)} className="text-xl font-bold bg-muted/50" />
        </div>

        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Paid Amount</label>
                    <Input type="number" value={paid} onChange={e => setPaid(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                <label className="text-sm font-medium">Due Date</label>
                <DatePicker date={date} onChange={setDate} />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <Input value={purpose} onChange={e => setPurpose(e.target.value)} />
            </div>
        </div>
      </div>

      <div className="p-4 border-t sticky bottom-0 bg-background/90 backdrop-blur">
        <Button className="w-full" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}