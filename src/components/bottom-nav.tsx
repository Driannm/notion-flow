"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  User, // Ganti CircleUser biar lebih clean
  Receipt, // Ganti ReceiptText
  UtensilsCrossed, // Ganti Soup (Menu)
  LayoutGrid, // Ganti Menu (More) icon jadi LayoutGrid (Apps)
  LogOut,
  Package,
  History,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils"; // Pastikan punya utils ini dari shadcn

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Menu Utama (4 Item)
  const menu = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Pelanggan", href: "/customer", icon: User },
    { name: "Order", href: "/order", icon: Receipt },
    { name: "Menu", href: "/menu", icon: UtensilsCrossed },
  ];

  // Menu Tambahan (Sheet)
  const moreMenu = [
    { name: "Package", href: "/package", icon: Package },
    { name: "History", href: "/order-history", icon: History },
  ];

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setOpen(false);
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      {/* 
        FLOATING ISLAND CONTAINER 
        - pointer-events-auto: biar bisa diklik walau parent-nya none
        - backdrop-blur-xl: efek kaca blur kuat
        - shadow-2xl: bayangan ngambang
      */}
      <div className="pointer-events-auto w-[90%] max-w-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-zinc-800 rounded-[2rem] px-6 py-4 shadow-2xl shadow-black/5 dark:shadow-black/20">
        
        <div className="flex items-center justify-between">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                  active ? "text-primary scale-105" : "text-muted-foreground hover:text-primary"
                )}
              >
                {/* Active Indicator (Titik kecil di atas icon) */}
                {active && (
                  <span className="absolute -top-2 w-1 h-1 rounded-full bg-primary animate-in fade-in zoom-in" />
                )}
                
                <Icon 
                  className={cn(
                    "w-6 h-6 transition-all", 
                    active ? "fill-primary/10 stroke-[2.5px]" : "stroke-2"
                  )} 
                />
                
                {/* Text Label (Optional: Bisa dihilangkan kalau mau super minimalis) */}
                <span className={cn(
                  "text-[10px] font-medium leading-none transition-all",
                  active ? "font-bold opacity-100" : "opacity-70"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* MORE BUTTON (SHEET TRIGGER) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors group">
                <LayoutGrid className="w-6 h-6 stroke-2 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium leading-none opacity-70 group-hover:opacity-100">App</span>
              </button>
            </SheetTrigger>

            {/* MORE MENU CONTENT */}
            <SheetContent side="bottom" className="rounded-t-[2.5rem] p-6 pb-10 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-t border-white/20 dark:border-zinc-800">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-center text-lg font-bold">Aplikasi Lainnya</SheetTitle>
                <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mt-2" />
              </SheetHeader>

              <div className="grid grid-cols-4 gap-4">
                {/* Render More Menu */}
                {moreMenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex flex-col items-center gap-2 group p-2"
                    >
                      <div className="w-14 h-14 rounded-[1.2rem] bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-sm border border-gray-100 dark:border-zinc-700">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary text-center leading-tight">
                        {item.name}
                      </span>
                    </Link>
                  );
                })}

                {/* LOGOUT BUTTON (Style Merah) */}
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 group p-2"
                >
                  <div className="w-14 h-14 rounded-[1.2rem] bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-500/20 text-red-500 transition-all duration-300 shadow-sm border border-red-100 dark:border-red-900/20">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-red-500/80 group-hover:text-red-600 dark:group-hover:text-red-400 text-center leading-tight">
                    {loading ? "..." : "Logout"}
                  </span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}