import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDebtById, deleteDebt } from "@/app/action/finance/debtsAction";
import { redirect } from "next/navigation";

// Next 15 Params Promise
export default async function DebtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { success, data } = await getDebtById(id);

  if (!success || !data) return notFound();

  // Helper Format
  const formatIDR = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  // Logic Status Color
  const isPaid = data.remaining <= 0;
  const statusColor = isPaid ? "text-green-600 bg-green-50" : data.status === "Overdue" ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50";

  // Server Action Delete (Inline)
  async function deleteAction() {
    "use server";
    await deleteDebt(id);
    redirect("/finance/debts");
  }

  return (
    <div className="w-full max-w-md min-h-screen mx-auto flex flex-col bg-background text-foreground relative">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/finance/debts-loans">
          <Button variant="ghost" size="icon" className="-ml-2"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <span className="text-sm font-semibold opacity-70 uppercase tracking-wide">Detail</span>
        <Link href={`/finance/debts-loans/${id}/edit`}>
            <Button variant="ghost" size="icon" className="-mr-2"><Edit className="w-5 h-5" /></Button>
        </Link>
      </div>

      <div className="flex-1 p-6">
        
        {/* Main Card */}
        <div className="flex flex-col items-center mb-8 pt-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${statusColor}`}>
                {data.status}
            </div>
            <h1 className="text-center font-bold text-xl mb-1">{data.name}</h1>
            <div className="text-sm text-muted-foreground mb-4">{data.purpose}</div>
            
            <div className="text-4xl font-bold tracking-tight text-foreground">
                {formatIDR(data.remaining).replace("Rp", "")}
                <span className="text-base font-normal text-muted-foreground ml-1">left</span>
            </div>
        </div>

        {/* Progress Section */}
        <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Paid: {formatIDR(data.paid)}</span>
                <span>Total: {formatIDR(data.total)}</span>
            </div>
            <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-1000 ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`} 
                    style={{ width: `${data.progress}%` }}
                />
            </div>
            <div className="text-right text-xs font-bold mt-1 text-muted-foreground">{Math.round(data.progress)}%</div>
        </div>

        {/* Details Grid */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" /> Due Date
                </div>
                <div className="font-medium text-sm">{formatDate(data.dueDate)}</div>
            </div>
            <div className="w-full h-[1px] bg-border/50" />
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {isPaid ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} Status
                </div>
                <div className="font-medium text-sm">{data.status}</div>
            </div>
        </div>

        {/* Delete Action */}
        <div className="mt-10">
            <form action={deleteAction}>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete Record
                </Button>
            </form>
        </div>

      </div>
    </div>
  );
}