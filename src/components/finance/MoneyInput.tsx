"use client";

import * as React from "react";
import { Input } from "@/components/ui/input"; // Pastikan path ini benar sesuai struktur projectmu
import { cn } from "@/lib/utils";

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string | number; // Bisa string kosong atau angka
  onValueChange: (value: string) => void; // Mengirim balik string angka murni ("100000")
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    
    // 1. Format nilai untuk ditampilkan di Input (tambah titik)
    const displayValue = React.useMemo(() => {
      if (value === "" || value === undefined || value === null) return "";
      return new Intl.NumberFormat("id-ID").format(Number(value));
    }, [value]);

    // 2. Handle saat user mengetik
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Ambil nilai input mentah (misal: "100.000")
      const inputValue = e.target.value;

      // Hapus semua karakter selain angka (hapus titik)
      const numericValue = inputValue.replace(/\D/g, "");

      // Kirim nilai bersih ke parent
      onValueChange(numericValue);
    };

    return (
      <div className="relative">
        {/* Prefix Rp otomatis */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
          Rp
        </span>
        <Input
          {...props}
          ref={ref}
          type="text" // Harus text, bukan number, agar bisa terima titik
          inputMode="numeric" // Memunculkan keyboard angka di HP
          value={displayValue}
          onChange={handleChange}
          className={cn("pl-9", className)} // pl-9 beri ruang untuk "Rp"
          placeholder="0"
        />
      </div>
    );
  }
);

MoneyInput.displayName = "MoneyInput";