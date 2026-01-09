import React from "react";
import { getFinancialInsights } from "@/app/action/finance/getInsights";
import InsightsClientView from "@/components/finance/insights/client-view";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const { success, data } = await getFinancialInsights();

  if (!success || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin" />
            <span className="text-xs font-medium">Gathering Data...</span>
        </div>
      </div>
    );
  }

  return <InsightsClientView data={data} />;
}