import BottomNav from "@/components/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex justify-center">
      {/* 
        Container utama:
        - max-w-md: Membatasi lebar agar seperti HP di layar besar
        - w-full: Full width di layar kecil
        - bg-gray-50: Warna background aplikasi
        - min-h-screen: Agar background selalu penuh
        - relative: Untuk positioning
      */}
      <div className="w-full max-w-md bg-gray-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
        
        {/* Konten Halaman */}
        <main className="flex-1 scroll-smooth">
          {children}
        </main>
        
        {/* Bottom Nav sudah fixed, tapi akan terlihat pas karena max-w-md di nav juga */}
        {/* <BottomNav /> */}
      </div>
    </div>
  );
}