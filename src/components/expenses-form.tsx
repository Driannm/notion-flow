"use client";

import { useState, useEffect, useRef } from "react";
import { addExpense } from "@/app/action"; // Sesuaikan path action lo
import { CATEGORY_IDS, PLATFORM_GROUPS, PAYMENT_GROUPS } from "@/lib/constants";
import { CategorySelect } from "@/components/expense/category-select";
import { AmountInput } from "@/components/expense/amount-input";

// ShadCN Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, CalendarIcon, Tag, Store, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Biar tanggal bahasa indo
import { cn } from "@/lib/utils";

export default function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // State Kategori
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

  useEffect(() => {
    // Hapus koma sebelum hitung preview total
    const parse = (val: string) => parseInt(val.replace(/,/g, "")) || 0;
    const sub = parse(values.subtotal);
    const ship = parse(values.shipping);
    const disc = parse(values.discount);
    const serv = parse(values.serviceFee);
    const add = parse(values.additionalFee);
    setTotal(sub + ship + serv + add - disc);
  }, [values]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  async function handleSubmit(formData: FormData) {
    // 1. Validasi
    const name = formData.get("name");
    if (!name || !selectedCategory || !values.subtotal) {
      toast.error("Nama, Kategori, dan Nominal wajib diisi!");
      return;
    }

    setLoading(true); // START LOADING

    try {
      formData.append("category", selectedCategory);
      formData.set("subtotal", values.subtotal.replace(/,/g, ""));
      if (values.shipping)
        formData.set("shipping", values.shipping.replace(/,/g, ""));
      // ... bersihkan field angka lain ...

      if (date) formData.append("date", date.toISOString());

      const result = await addExpense(formData);

      if (result.success) {
        toast.success(result.message);
        formRef.current?.reset();
        setValues({
          subtotal: "",
          shipping: "",
          discount: "",
          serviceFee: "",
          additionalFee: "",
        });
        setSelectedCategory("");
        setTotal(0);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg border-0 shadow-none sm:shadow-xl sm:border sm:bg-card/50 sm:backdrop-blur-xl">
      <CardContent className="p-0 sm:p-6">
        <form
          ref={formRef}
          action={handleSubmit}
          onSubmit={(e) => {
            e.preventDefault();
            setLoading(true);
            handleSubmit(new FormData(e.currentTarget));
          }}
          className="space-y-8 pb-20 sm:pb-0"
        >
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

          {/* 2. SECTION KATEGORI */}
          <div className="space-y-2 px-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold pl-1">
              Kategori
            </Label>
            <CategorySelect
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>

          {/* 3. SECTION DETAIL (TANGGAL & OPTIONAL) */}
          {/* Row Tanggal & Metode */}
          <div className="space-y-1.5 px-4">
            <Label className="text-xs text-muted-foreground ml-1">
              Tanggal
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-11 bg-background border-border/50",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? (
                    format(date, "d MMM", { locale: id })
                  ) : (
                    <span>Pilih</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1.5 px-4">
              <Label className="text-xs text-muted-foreground ml-1">
                Pembayaran
              </Label>
              <Select name="paymentMethod">
                <SelectTrigger className="h-11 w-full bg-background border-border/50 justify-start text-left">
                  <Wallet className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>

                <SelectContent className="max-h-64">
                  {Object.entries(PAYMENT_GROUPS).map(([groupName, items]) => (
                    <SelectGroup key={groupName}>
                      <SelectLabel className="text-xs text-muted-foreground">
                        {groupName}
                      </SelectLabel>

                      {items.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row Platform */}
            <div className="space-y-1.5 px-4">
              <Label className="text-xs text-muted-foreground ml-1">
                Beli di mana?
              </Label>
              <Select name="platform">
                <SelectTrigger className="h-11 w-full bg-background border-border/50 justify-start text-left">
                  <Store className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Pilih Toko/App (Opsional)" />
                </SelectTrigger>

                <SelectContent className="max-h-72">
                  {" "}
                  {/* biar scrollable */}
                  <SelectItem value="none">-- Skip --</SelectItem>
                  {Object.entries(PLATFORM_GROUPS).map(([groupName, items]) => (
                    <SelectGroup key={groupName}>
                      <SelectLabel className="text-xs text-muted-foreground">
                        {groupName}
                      </SelectLabel>
                      {items.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-3xl p-5 mx-4 sm:mx-0 space-y-4 px-4">
            {/* ACCORDION (BIAYA TAMBAHAN) */}
            <Accordion
              type="single"
              collapsible
              className="w-full border-t border-dashed border-muted-foreground/20 pt-2"
            >
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
                      <Input
                        name="shipping"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        className="h-9 bg-background"
                        value={values.shipping}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-green-600">
                        Discount
                      </Label>
                      <Input
                        name="discount"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        className="h-9 bg-background border-green-200 focus-visible:ring-green-500"
                        value={values.discount}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">
                        Service Fee
                      </Label>
                      <Input
                        name="serviceFee"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        className="h-9 bg-background"
                        value={values.serviceFee}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase">Extra Fee</Label>
                      <Input
                        name="additionalFee"
                        type="number"
                        inputMode="numeric"
                        placeholder="0"
                        className="h-9 bg-background"
                        value={values.additionalFee}
                        onChange={handleChange}
                      />
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
                <p className="text-xs text-muted-foreground font-medium">
                  Total Estimasi
                </p>
                <p className="text-xl font-bold text-primary truncate">
                  Rp {total.toLocaleString("id-ID")}
                </p>
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-8 shadow-lg shadow-primary/20"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
