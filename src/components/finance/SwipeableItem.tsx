"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  PanInfo,
} from "framer-motion";
import { Edit, Trash2 } from "lucide-react";

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  onClick: () => void;
}

// Generate a random ID for the event bus if the item doesn't have a unique key prop context
const generateId = () => Math.random().toString(36).substr(2, 9);

export const SwipeableItem = ({
  children,
  onDelete,
  onEdit,
  onClick,
}: SwipeableItemProps) => {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Unique ID for the "Single Open" event bus logic
  const itemId = useRef(generateId());

  // CONSTANTS
  const MAX_DRAG = -160; // Allow pulling slightly further for rubber-band feel
  const OPEN_POSITION = -120; // Where it rests when open
  const SNAP_THRESHOLD = -60; // Distance required to snap open
  const VELOCITY_THRESHOLD = -300; // Speed required to snap open regardless of distance

  // --- INTERPOLATIONS FOR PROGRESSIVE FEEDBACK ---
  
  // Buttons fade in as you drag
  const buttonOpacity = useTransform(x, [-20, -100], [0, 1]);
  
  // Buttons slide slightly from right to left (Parallax effect)
  // This makes the UI feel "connected" rather than just static background
  const buttonsX = useTransform(x, [0, OPEN_POSITION], [20, 0]);
  const buttonsScale = useTransform(x, [MAX_DRAG, OPEN_POSITION], [1.1, 1]);

  // --- SINGLE OPEN ITEM LOGIC ---
  useEffect(() => {
    const handleCloseOthers = (e: CustomEvent) => {
      // If the event triggered isn't for THIS item, close this item
      if (e.detail.id !== itemId.current && isOpen) {
        closeItem();
      }
    };

    // Listen for the custom event
    window.addEventListener("close-swipeable-item", handleCloseOthers as EventListener);
    return () => {
      window.removeEventListener("close-swipeable-item", handleCloseOthers as EventListener);
    };
  }, [isOpen]);

  const notifyOpen = () => {
    const event = new CustomEvent("close-swipeable-item", {
      detail: { id: itemId.current },
    });
    window.dispatchEvent(event);
  };

  // --- ACTIONS ---

  const closeItem = () => {
    controls.start({
      x: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    });
    setIsOpen(false);
  };

  const openItem = () => {
    notifyOpen(); // Close others first
    controls.start({
      x: OPEN_POSITION,
      transition: { type: "spring", stiffness: 400, damping: 25 },
    });
    setIsOpen(true);
  };

  // --- HANDLERS ---

  const handleDragStart = () => {
    setIsDragging(true);
    notifyOpen(); // Optimistically close others when user starts touching this one
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    // Small timeout to prevent click trigger immediately after drag release
    setTimeout(() => setIsDragging(false), 100);

    const { offset, velocity } = info;
    const swipeDistance = offset.x;
    const swipeVelocity = velocity.x;

    // Smart Threshold Logic:
    // Open if: Dragged far enough OR Flicked fast enough to the left
    const shouldOpen =
      swipeDistance < SNAP_THRESHOLD || swipeVelocity < VELOCITY_THRESHOLD;

    if (shouldOpen) {
      openItem();
    } else {
      closeItem();
    }
  };

  const handleCardClick = () => {
    if (isDragging) return;

    if (isOpen) {
      closeItem();
    } else {
      onClick();
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl mb-2 select-none">
      {/* Ganti rounded-[1.5rem] menjadi rounded-2xl untuk konsistensi */}
      
      {/* --- BACKGROUND ACTIONS --- */}
      {/* Uses motion.div for progressive opacity/movement */}
      <motion.div 
        style={{ 
          opacity: buttonOpacity, 
          x: buttonsX, 
          scale: buttonsScale 
        }}
        className="absolute top-0 right-0 h-full flex w-[140px] z-0"
      >
        <div className="w-full h-full flex gap-1 p-1 pl-4"> 
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              closeItem();
            }}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex flex-col items-center justify-center transition-colors shadow-inner active:scale-95"
            // Safety: Disable pointer events when closed to prevent ghost clicks
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            <Edit className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold uppercase">Edit</span>
          </button>

          {/* Delete Button - Visually Distinct */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
              closeItem();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex flex-col items-center justify-center transition-colors shadow-inner active:scale-95"
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          >
            <Trash2 className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-bold uppercase">Delete</span>
          </button>
        </div>
      </motion.div>

      {/* --- FOREGROUND CARD --- */}
      {/* Hapus border-radius dari sini, biarkan parent yang handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: MAX_DRAG, right: 0 }}
        dragElastic={{ right: 0.05, left: 0.1 }} // Stiffer right, bouncy left
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: "pan-y" }}
        className="relative z-10 bg-background cursor-pointer active:cursor-grabbing"
        onClick={handleCardClick}
        whileTap={{ scale: 0.98 }} // Micro-interaction on press
      >
        {/* Children sudah memiliki border-radius sendiri */}
        {children}
      </motion.div>
    </div>
  );
};