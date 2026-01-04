import Notes from "@/components/notes/notes-grid";
import { ModeToggle } from "@/components/ModeToggle";
import { Toaster } from "react-hot-toast";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 
        Toaster: 
        Komponen untuk menampilkan notifikasi pop-up (toast).
        Biasanya diletakkan di root agar bisa muncul di mana saja.
      */}
      <Toaster position="bottom-center" reverseOrder={false} />

      {/* 
        ModeToggle:
        Saya buat 'absolute' atau 'fixed' agar melayang di atas header Notes.
        Sesuaikan 'top' dan 'right' agar pas dengan layout header Notes Anda.
        z-50 memastikan tombol ini selalu di paling depan.
      */}
      {/* <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div> */}

      {/* Komponen Utama Aplikasi Catatan */}
      <Notes />
    </main>
  );
}