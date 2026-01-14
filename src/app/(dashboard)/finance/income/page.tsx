import * as React from "react";
import { getIncomes } from "@/app/action/finance/getIncome"; // Sesuaikan path
import IncomeClientView from "@/components/finance/income/client-view";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const { success, data } = await getIncomes();

  if (!success || !data) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
            <Loader2 className="animate-spin text-zinc-400" />
        </div>
    );
  }

  return <IncomeClientView data={data} />;
}