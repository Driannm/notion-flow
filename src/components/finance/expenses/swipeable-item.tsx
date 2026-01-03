"use client";

import React, { useState } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  onClick: () => void;
}

export const SwipeableItem = ({
  children,
  onDelete,
  onEdit,
  onClick,
}: SwipeableItemProps) => {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // Flag untuk cegah klik saat drag

  // Batas geser agar tombol terbuka (Geser ke Kiri, nilai negatif)
  const OPEN_THRESHOLD = -120; 

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    // Beri delay sedikit agar state isDragging tidak langsung false saat mouse diangkat
    // Ini mencegah event onClick tereksekusi tepat setelah drag selesai
    setTimeout(() => setIsDragging(false), 100);

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Logic: Jika geser ke kiri cukup jauh ATAU swipe cepat ke kiri
    if (offset < -60 || velocity < -500) {
      await controls.start({ x: OPEN_THRESHOLD });
      setIsOpen(true);
    } else {
      // Kembalikan ke posisi semula
      await controls.start({ x: 0 });
      setIsOpen(false);
    }
  };

  const handleCardClick = () => {
    // 1. Jika sedang dalam mode drag, jangan lakukan apa-apa
    if (isDragging) return;

    // 2. Jika menu sedang terbuka, tutup menu dulu
    if (isOpen) {
      controls.start({ x: 0 });
      setIsOpen(false);
    } else {
      // 3. Jika tertutup dan tidak drag, baru masuk detail
      onClick();
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl mb-3">
      {/* BACKGROUND ACTIONS (Tombol di Belakang) */}
      <div className="absolute top-0 right-0 h-full flex w-[120px]">
        {/* Tombol Edit */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
            controls.start({ x: 0 }); 
            setIsOpen(false);
          }}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center transition-colors rounded-l-xl"
        >
          <Edit className="w-5 h-5" />
        </button>

        {/* Tombol Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            controls.start({ x: 0 });
            setIsOpen(false);
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors rounded-r-xl"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* FOREGROUND CARD */}
      <motion.div
        drag="x"
        // Hanya boleh geser ke kiri (nilai negatif), max kanan 0
        dragConstraints={{ left: OPEN_THRESHOLD, right: 0 }} 
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)} // Mulai deteksi drag
        onDragEnd={handleDragEnd}
        animate={controls}
        onClick={handleCardClick} // Pakai custom handler
        className="relative z-10 bg-background cursor-pointer" // Tambah cursor-pointer
        style={{ touchAction: "pan-y" }} // Penting buat scroll vertical lancar di HP
      >
        {children}
      </motion.div>
    </div>
  );
};