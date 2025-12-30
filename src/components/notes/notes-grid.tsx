"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Lock, MoreVertical, Pin, Trash2, Calendar } from 'lucide-react';

// 1. Definisikan Tipe Data (Interface)
interface NoteItem {
  id: string;
  type: string;
  title: string;
  content: string;
  category: string | null;
  date: string;
  image: string | null;
  isPinned: boolean;
  tasks?: any[]; // Opsional jika nanti ada tasks
  collaborators?: number;
}

export default function NotesApp() {
  // --- STATE MANAGEMENT ---
  // 2. Tambahkan tipe <NoteItem[]> pada useState agar tidak dianggap 'never'
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/notes', { cache: 'no-store' });
        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // --- LOGIC ---
  const filteredItems = items.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(term)) ||
      (item.content && item.content.toLowerCase().includes(term)) ||
      (item.category && item.category.toLowerCase().includes(term))
    );
  });

  const pinnedItem = filteredItems.find(item => item.isPinned && item.type !== 'locked');
  const gridItems = filteredItems.filter(item => item.id !== pinnedItem?.id);

  // --- HANDLERS ---
  // 3. Tambahkan tipe parameter (id: string, e: React.MouseEvent)
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Hapus note ini? (Hanya simulasi UI)")) {
      setItems(prev => prev.filter(item => item.id !== id));
      setActiveMenuId(null);
    }
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, isPinned: !item.isPinned };
      return item; 
    }));
    setActiveMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // 4. Definisikan tipe options date format
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }; 
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
        <p className="text-sm text-gray-500 animate-pulse">Syncing with Notion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24">
      
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm/50 backdrop-blur-xl bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-2 border-gray-100 shadow-sm">
                <span className="text-xl">📝</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">My Notes</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={24} />
            </button>
          </div>

          {/* SEARCH BAR */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:bg-white transition-all shadow-inner placeholder:text-gray-400"
            />
            {searchTerm && (
               <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors">CLEAR</button>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">

          {/* 1. HERO CARD (PINNED) */}
          {pinnedItem && (
            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group transition-all hover:shadow-md mb-2">
              <div className="relative h-48 md:h-50 bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pinnedItem.image || 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=1000'}
                  alt={pinnedItem.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-90 transition-opacity duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/30">
                  <Pin size={14} className="text-white fill-current" />
                </div>
                {/* Menu Pinned */}
                <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setActiveMenuId(activeMenuId === pinnedItem.id ? null : pinnedItem.id)} className="p-2 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full text-white transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    {activeMenuId === pinnedItem.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl py-1 z-30 border border-gray-100 overflow-hidden text-xs font-medium">
                            <button onClick={(e) => handleTogglePin(pinnedItem.id, e)} className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                <Pin size={14} className="rotate-45" /> Unpin Note
                            </button>
                        </div>
                    )}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg leading-tight text-gray-900 mb-2">{pinnedItem.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pinnedItem.content || "No summary available."}</p>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  {pinnedItem.category && <span className="text-[10px] uppercase tracking-wider font-bold bg-black text-white px-3 py-1.5 rounded-full">{pinnedItem.category}</span>}
                  <div className="flex items-center gap-1 text-xs text-gray-400 font-medium"><Calendar size={12} /><span>{formatDate(pinnedItem.date)}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* 2. REGULAR GRID ITEMS */}
          {gridItems.map((item) => {
            if (item.type === 'locked') {
              return (
                <div key={item.id} className="h-50 bg-gray-100 rounded-3xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 group hover:border-gray-300 transition-colors">
                    <div className="w-12 h-12 bg-gray-200 group-hover:bg-gray-300 text-gray-500 rounded-2xl flex items-center justify-center mb-3 transition-colors">
                        <Lock size={20} />
                    </div>
                    <span className="font-semibold text-sm text-gray-600">Locked</span>
                    <span className="text-[10px] text-gray-400 mt-1">{formatDate(item.date)}</span>
                </div>
              );
            }

            return (
              <div key={item.id} className="group relative flex flex-col justify-between h-50 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="overflow-hidden">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-gray-900 h-10">
                            {item.title}
                        </h3>
                        
                        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)} className="text-gray-300 hover:text-black hover:bg-gray-100 rounded-full p-1 transition-colors">
                                <MoreVertical size={16} />
                            </button>
                            {activeMenuId === item.id && (
                                <div className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-xl py-1 z-30 border border-gray-100 text-xs font-medium animate-in fade-in zoom-in-95 origin-top-right">
                                    <button onClick={(e) => handleTogglePin(item.id, e)} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"><Pin size={12} /> Pin Note</button>
                                    <button onClick={(e) => handleDelete(item.id, e)} className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-500"><Trash2 size={12} /> Delete</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {item.image ? (
                        <div className="w-full h-28 bg-gray-100 rounded-xl overflow-hidden mt-1 border border-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                    ) : (
                         <p className="text-xs text-gray-500 line-clamp-6 leading-relaxed mt-1">
                            {item.content || "No additional text content."}
                        </p>
                    )}
                </div>

                <div className="mt-3 flex justify-between items-end border-t border-gray-50 pt-3">
                    {item.category ? (
                        <span className="text-[10px] px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md font-medium truncate max-w-[50%]">
                            {item.category}
                        </span>
                    ) : <span></span>}
                    <span className="text-[10px] text-gray-400 font-medium">{formatDate(item.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {gridItems.length === 0 && !pinnedItem && !isLoading && (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No notes found</h3>
                <p className="text-gray-400 text-xs max-w-[200px]">Coba cari kata kunci lain atau tambahkan catatan di Notion.</p>
            </div>
        )}
      </div>

      <button 
        onClick={() => window.open(`https://notion.so/${process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || ''}`, '_blank')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg shadow-black/30 hover:scale-110 hover:shadow-xl transition-all duration-300 z-40 active:scale-95 group"
      >
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
}