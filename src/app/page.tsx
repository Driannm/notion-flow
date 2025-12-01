// src/app/page.tsx
import ExpenseForm from "@/components/expenses-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background transition-colors duration-300">
      
      {/* Navbar Simple */}
      <nav className="p-4 flex justify-between items-center max-w-lg mx-auto">
        <h1 className="font-bold text-lg tracking-tight">Family Finance</h1>
        <ModeToggle />
      </nav>

      {/* Konten Tengah */}
      <div className="flex flex-col items-center justify-center p-4 pb-20">
        <ExpenseForm />
      </div>

      {/* Toast */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </main>
  );
}