/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

import { addIncome } from "@/app/action/finance/ActionIncome";
import { INCOME_SOURCES, PAYMENT_GROUPS } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";

export default function IncomeTransactionForm({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "");
    if (!numericValue) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numericValue));
  };

  const handleAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const numericValue = e.target.value.replace(/[^\d]/g, "");
    setAmount(numericValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!amount || !description || !incomeSource || !bankAccount) {
      toast.error("Data belum lengkap", {
        description: "Semua field wajib diisi.",
      });
      return;
    }
  
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append("name", description);
      formData.append("incomeSource", incomeSource);
      formData.append("amount", amount);
      formData.append("bankAccount", bankAccount);
      formData.append("date", date.toISOString());
  
      const result = await addIncome(formData);
  
      if (!result.success) {
        throw new Error(result.message);
      }
  
      toast.success("Income berhasil disimpan!", {
        description: `${description} - Rp ${formatCurrency(amount)}`,
        duration: 3000,
      });
  
      setAmount("");
      setDescription("");
      setIncomeSource("");
      setBankAccount("");
      setDate(new Date());
  
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error: any) {
      toast.error("Gagal menyimpan income", {
        description: error?.message || "Terjadi kesalahan sistem.",
      });
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div
      className="w-full max-w-md min-h-screen mx-auto flex flex-col relative overflow-hidden
      bg-background text-foreground"
    >
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-muted transition"
          type="button"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
  
        <div className="font-semibold text-sm uppercase tracking-wider opacity-70">
          Add Income
        </div>
  
        <div className="w-9" />
      </div>
  
      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-6">
  
        {/* Amount Section */}
        <div className="m-4 p-6 rounded-xl border border-border shadow bg-card text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-4xl font-bold text-muted-foreground">
              Rp
            </span>
            <input
              type="text"
              value={formatCurrency(amount)}
              onChange={handleAmountChange}
              placeholder="0"
              className="text-5xl font-bold font-mono bg-transparent border-none outline-none text-center w-full max-w-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>
  
          <div className="text-sm text-muted-foreground mt-3">
            {format(date, "dd MMM yyyy")}
          </div>
        </div>
  
        {/* Form Section */}
        <div className="m-4 mt-0 p-6 rounded-xl border border-border bg-card space-y-6 shadow-sm">
  
          {/* Date */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover
              open={isCalendarOpen}
              onOpenChange={setIsCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                >
                  {format(date, "dd/MM/yyyy")}
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    if (d) {
                      setDate(d);
                      setIsCalendarOpen(false);
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
  
          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Income description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
  
          {/* Income Source */}
          <div className="space-y-2">
            <Label>Income Source</Label>
            <Select
              value={incomeSource}
              onValueChange={setIncomeSource}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select income source" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
          {/* Bank Account */}
          <div className="space-y-2">
            <Label>Bank Account</Label>
            <Select
              value={bankAccount}
              onValueChange={setBankAccount}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_GROUPS.Bank.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
  
        </div>
      </div>
  
      {/* Bottom Action */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-md sticky bottom-0 z-20">
        <Button
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
          className="w-full h-12 text-base font-semibold rounded-xl"
        >
          {isLoading ? "Processing..." : "Add Income"}
        </Button>
      </div>
    </div>
  );  
}