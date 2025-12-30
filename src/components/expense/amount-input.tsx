"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils"; // Pastikan path ini benar

interface AmountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  
  // 1. Fungsi formatter: Mengubah "10000" jadi "10,000"
  // Kalau mau pakai Titik (format Indo), ganti koma di regex bawah jadi titik
  const formatDisplayValue = (val: string) => {
    if (!val) return "";
    // Hapus karakter non-digit dulu untuk safety
    const cleanVal = val.replace(/\D/g, "");
    // Regex untuk nambah koma per 3 digit
    return cleanVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 2. Handle Change: Membersihkan koma sebelum kirim ke parent
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ambil value yang diketik user (misal: "10,005")
    const rawInput = e.target.value;
    
    // Hapus semua koma (atau titik) biar jadi angka murni (misal: "10005")
    const cleanValue = rawInput.replace(/,/g, "");

    // Validasi: Pastikan hanya angka
    if (!/^\d*$/.test(cleanValue)) {
      return; // Jangan update jika user ketik huruf
    }
    onChange(e);
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pl-1">
        Total Nominal (Subtotal)
      </Label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xl">
          Rp
        </span>
        <Input
          name="subtotal"
          type="text"
          inputMode="numeric"
          placeholder="0"
          className={cn(
            "pl-12 h-16 text-3xl font-bold bg-background",
            "border-2 border-muted focus-visible:border-primary focus-visible:ring-0",
            "rounded-2xl transition-all"
          )}
          // 3. Tampilkan value yang sudah diformat
          value={formatDisplayValue(value)} 
          onChange={handleChange}
          autoComplete="off"
        />
      </div>
    </div>
  );
}