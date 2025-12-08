import { Inter, Bricolage_Grotesque } from "next/font/google"; // 1. Import font kedua 
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// 2. Konfigurasi Font Pertama (Manrope)
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter", // Definisi nama variabel CSS
});

// 3. Konfigurasi Font Kedua (Contoh: Playfair Display)
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"], // Sesuaikan weight yang butuh saja
  variable: "--font-bricolage_grotesque", // Definisi nama variabel CSS
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 4. Gabungkan kedua variabel font di className
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${bricolage.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}