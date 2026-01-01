"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Loader2,
  BanknoteArrowDown,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { addExpense } from "@/app/action";
import { ICON_MAP } from "@/lib/constants";

// Custom components
import { DatePicker } from "@/components/expense/date-picker";
import { CategorySelect } from "@/components/expense/category-select";
import { PlatformSelect } from "@/components/expense/platform-select";
import { PaymentSelect } from "@/components/expense/payment-select";

type BreakdownField = {
  id: string;
  label: string;
  value: string;
};

export default function ExpenseForm() {
  // Refs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();

  // UI States
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("info");
  const [isBreakdownOpen, setIsBreakdownOpen] = React.useState(false);

  // Template State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [templates, setTemplates] = React.useState<any[]>([]);

  // Info States
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [platform, setPlatform] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Proof States
  const [subtotal, setSubtotal] = React.useState("");
  const [receipt, setReceipt] = React.useState<File | null>(null);

  const [breakdownFields, setBreakdownFields] = React.useState<
    BreakdownField[]
  >([
    { id: "shipping", label: "Shipping", value: "" },
    { id: "discount", label: "Discount", value: "" },
    { id: "serviceFee", label: "Service Fee", value: "" },
    { id: "additionalFee", label: "Additional Fee", value: "" },
  ]);

  // Calculate Total Amount
  const totalAmount = React.useMemo(() => {
    const base = parseFloat(subtotal) || 0;
    const extra = breakdownFields.reduce((sum, f) => {
      const val = parseFloat(f.value) || 0;
      return f.id === "discount" ? sum - val : sum + val;
    }, 0);
    return base + extra;
  }, [subtotal, breakdownFields]);

  // Format Currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  // Fetch Templates on Mount
  React.useEffect(() => {
    async function loadTemplates() {
      try {
        const res = await fetch("/api/templates");

        if (!res.ok) {
          throw new Error("API error");
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Templates is not array");
        }

        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates", err);
        setTemplates([]);
      }
    }

    loadTemplates();
  }, []);

  // Update Breakdown Field
  const updateBreakdownField = (id: string, value: string) => {
    setBreakdownFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value } : f))
    );
  };

  // Handle Template Selection
  function handleTemplateSelect(templateId: string) {
    const t = templates.find((x) => x.id === templateId);
    if (!t) return;

    // Set basic info
    setTitle(t.name ?? "");
    setCategory(t.category ?? "");
    setPaymentMethod(t.paymentMethod ?? "");
    setPlatform(t.platform ?? "");

    // Set subtotal
    setSubtotal(String(t.subtotal ?? ""));

    // Set breakdown fields
    setBreakdownFields([
      { id: "shipping", label: "Shipping", value: String(t.shipping ?? "") },
      { id: "discount", label: "Discount", value: String(t.discount ?? "") },
      {
        id: "serviceFee",
        label: "Service Fee",
        value: String(t.serviceFee ?? ""),
      },
      {
        id: "additionalFee",
        label: "Additional Fee",
        value: String(t.additionalFee ?? ""),
      },
    ]);

    // Auto switch to info tab
    setActiveTab("info");
  }

  // Handle Submit
  const handleSubmit = async () => {
    // Validation
    if (!title || !category || !subtotal) {
      toast.error("Nama, Kategori, dan Nominal wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Required fields
      formData.append("name", title);
      formData.append("category", category);
      formData.append("subtotal", subtotal.replace(/,/g, ""));

      // Optional fields
      if (date) formData.append("date", date.toISOString());
      if (paymentMethod) formData.append("paymentMethod", paymentMethod);
      if (platform && platform !== "none")
        formData.append("platform", platform);

      // Breakdown fields
      const shipping = breakdownFields.find((f) => f.id === "shipping")?.value;
      const discount = breakdownFields.find((f) => f.id === "discount")?.value;
      const serviceFee = breakdownFields.find(
        (f) => f.id === "serviceFee"
      )?.value;
      const additionalFee = breakdownFields.find(
        (f) => f.id === "additionalFee"
      )?.value;

      if (shipping) formData.append("shipping", shipping.replace(/,/g, ""));
      if (discount) formData.append("discount", discount.replace(/,/g, ""));
      if (serviceFee)
        formData.append("serviceFee", serviceFee.replace(/,/g, ""));
      if (additionalFee)
        formData.append("additionalFee", additionalFee.replace(/,/g, ""));

      const result = await addExpense(formData);

      if (result.success) {
        toast.success(result.message);

        // Reset form
        setTitle("");
        setCategory("");
        setPlatform("");
        setPaymentMethod("");
        setSubtotal("");
        setReceipt(null);
        setBreakdownFields([
          { id: "shipping", label: "Shipping", value: "" },
          { id: "discount", label: "Discount", value: "" },
          { id: "serviceFee", label: "Service Fee", value: "" },
          { id: "additionalFee", label: "Additional Fee", value: "" },
        ]);
        setDate(new Date());
        setActiveTab("info");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      console.error(error);
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
      {/* <div className="px-4 py-4 border-b border-border flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-primary transition"
        >
          <ChevronLeft size={16} />
          Back
        </button>
      </div> */}

      {/* Summary Card */}
      <div className="m-4 p-6 rounded-xl border border-border shadow bg-card">
        <h1 className="text-2xl font-semibold mb-2">Add Expenses</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Track your spending efficiently and make informed financial decisions.
        </p>

        <div className="w-14 h-14 dark:bg-blue-200 bg-blue-300 rounded-xl flex items-center justify-center mx-auto mb-4">
          {(() => {
            const Icon = category
              ? ICON_MAP[category] || ICON_MAP.default
              : BanknoteArrowDown;
            return <Icon className="text-primary-foreground" size={28} />;
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
          {formatCurrency(totalAmount)}
        </div>
      </div>

      {/* Template Selection */}
      <div className="mx-4 mb-2">
        <Select onValueChange={handleTemplateSelect}>
          <SelectTrigger className="h-11 w-full justify-start">
            <SelectValue placeholder="Pakai template (opsional)" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                Template • {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 bg-muted mt-2 w-90 xl:w-105">
          <TabsTrigger value="info" className="flex-1">
            Informations
          </TabsTrigger>
          <TabsTrigger value="proof" className="flex-1">
            Expense Details
          </TabsTrigger>
        </TabsList>

        {/* INFO TAB */}
        <TabsContent
          value="info"
          className="m-4 mt-0 p-6 rounded-xl border border-border bg-card"
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name of expense</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kopi Kenangan"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground ml-1">
                Tanggal
              </Label>
              <DatePicker date={date} onChange={setDate} />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <CategorySelect value={category} onChange={setCategory} />
            </div>

            <div>
              <label className="text-sm font-medium">Platform</label>
              <PlatformSelect value={platform} onChange={setPlatform} />
            </div>

            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <PaymentSelect
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </div>
          </div>
        </TabsContent>

        {/* PROOF TAB */}
        <TabsContent
          value="proof"
          className="m-4 mt-0 p-6 rounded-xl border border-border bg-card"
        >
          <div className="space-y-4">
            {/* Subtotal */}
            <div>
              <label className="text-sm font-medium">Subtotal</label>
              <Input
                type="number"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="0"
                required
              />
            </div>

            {/* Expense Breakdown */}
            <div>
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setIsBreakdownOpen((v) => !v)}
                type="button"
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
                          value={field.value}
                          onChange={(e) =>
                            updateBreakdownField(field.id, e.target.value)
                          }
                          placeholder="0"
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="p-4 border-t border-border">
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit expense"
          )}
        </Button>
      </div>
    </div>
  );
}
