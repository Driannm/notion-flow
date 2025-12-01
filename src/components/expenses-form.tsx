"use client";

import { useState, useEffect, useRef } from "react";
import { addExpense } from "@/app/action"; // Sesuaikan path action lo
import { PLATFORM_IDS, PAYMENT_METHODS } from "@/lib/constants";
import { CategoryGrid } from "@/components/expense/category-grid";
import { AmountInput } from "@/components/expense/amount-input";

// ShadCN Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, CalendarIcon, Plus, Tag, Store, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Biar tanggal bahasa indo
import { cn } from "@/lib/utils";

export default function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // State Angka
  const [values, setValues] = useState({
    subtotal: "",
    shipping: "",
    discount: "",
    serviceFee: "",
    additionalFee: "",
  });
  const [total, setTotal] = useState(0);

  // Kalkulasi Total
  useEffect(() => {
    const sub = parseInt(values.subtotal) || 0;
    const ship = parseInt(values.shipping) || 0;
    const disc = parseInt(values.discount) || 0;
    const serv = parseInt(values.serviceFee) || 0;
    const add = parseInt(values.additionalFee) || 0;
    setTotal(sub + ship + serv + add - disc);
  }, [values]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  async function handleSubmit(formData: FormData) {
    if (!selectedCategory || !values.subtotal) {
      toast.error("Isi nominal dan kategori dulu! 😡");
      return;
    }

    setLoading(true);
    formData.append("category", selectedCategory);
    if (date) formData.append("date", date.toISOString());

    const result = await addExpense(formData);
    
    if (result.success) {
      toast.success(result.message, { style: { borderRadius: "10px", background: "#333", color: "#fff" } });
      formRef.current?.reset();
      setValues({ subtotal: "", shipping: "", discount: "", serviceFee: "", additionalFee: "" });
      setSelectedCategory("");
      setTotal(0);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  }

  return (
    <Card className="w-full max-w-lg border-0 shadow-none sm:shadow-xl sm:border sm:bg-card/50 sm:backdrop-blur-xl">
      <CardContent className="p-0 sm:p-6">
        <form ref={formRef} action={handleSubmit} className="space-y-8 pb-20 sm:pb-0">
          
          {/* 1. SECTION DUIT & NAMA (HERO) */}
          <div className="space-y-4 px-4 pt-4 sm:px-0 sm:pt-0">
            <AmountInput value={values.subtotal} onChange={handleChange} />
            
            <div className="grid grid-cols-1 gap-4">
              <Input 
                name="name" 
                placeholder="Buat beli apa? (e.g. Nasi Padang)" 
                className="h-12 bg-muted/30 border-muted focus-visible:ring-primary/20 text-lg"
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* 2. SECTION KATEGORI (GRID) */}
          <div className="space-y-3 px-4 sm:px-0">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pl-1">
              Kategori
            </Label>
            <CategoryGrid value={selectedCategory} onChange={setSelectedCategory} />
          </div>

          {/* 3. SECTION DETAIL (TANGGAL & OPTIONAL) */}
          <div className="bg-muted/30 rounded-3xl p-5 mx-4 sm:mx-0 space-y-4 border border-muted/50">
            
            {/* Row Tanggal & Metode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground ml-1">Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-11 bg-background border-border/50", !date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {date ? format(date, "d MMM", { locale: id }) : <span>Pilih</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground ml-1">Pembayaran</Label>
                <Select name="paymentMethod" defaultValue="Bank Central Asia">
                  <SelectTrigger className="h-11 bg-background border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row Platform */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground ml-1">Beli di mana?</Label>
              <Select name="platform">
                <SelectTrigger className="h-11 bg-background border-border/50">
                  <Store className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Pilih Toko/App (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Skip --</SelectItem>
                  {Object.keys(PLATFORM_IDS).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* ACCORDION (BIAYA TAMBAHAN) */}
            <Accordion type="single" collapsible className="w-full border-t border-dashed border-muted-foreground/20 pt-2">
              <AccordionItem value="details" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium text-muted-foreground hover:text-primary">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4" /> Tambah Ongkir / Diskon?
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Shipping</Label>
                      <Input name="shipping" type="number" placeholder="0" className="h-9 bg-background" value={values.shipping} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-green-600">Discount</Label>
                      <Input name="discount" type="number" placeholder="0" className="h-9 bg-background border-green-200 focus-visible:ring-green-500" value={values.discount} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Service Fee</Label>
                      <Input name="serviceFee" type="number" placeholder="0" className="h-9 bg-background" value={values.serviceFee} onChange={handleChange} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Extra Fee</Label>
                      <Input name="additionalFee" type="number" placeholder="0" className="h-9 bg-background" value={values.additionalFee} onChange={handleChange} />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* 4. FLOATING BOTTOM BAR (MOBILE FIRST) */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t sm:relative sm:border-0 sm:bg-transparent sm:p-0 z-50">
            <div className="max-w-lg mx-auto flex gap-4 items-center">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">Total Estimasi</p>
                <p className="text-xl font-bold text-primary truncate">
                  Rp {total.toLocaleString("id-ID")}
                </p>
              </div>
              <Button type="submit" size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Simpan"}
              </Button>
            </div>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}