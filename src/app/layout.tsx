import { Inter, Bricolage_Grotesque, Space_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// 1. Konfigurasi Font Pertama (Manrope/Inter)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

// 2. Konfigurasi Font Kedua (Bricolage)
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-bricolage_grotesque",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-space_grotesk",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${bricolage.variable} ${space.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Tambahkan LanguageProvider DI DALAM ThemeProvider */}
          <LanguageProvider>
             {/* Wrapper Layout Kamu */}
             <div className="min-h-screen flex justify-center bg-zinc-100 dark:bg-zinc-950">
                <div className="w-full max-w-md ...">
                  <main className="flex-1 scroll-smooth">
                    {children}
                  </main>
                </div>
             </div>
          </LanguageProvider>

          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}