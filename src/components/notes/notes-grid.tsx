"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Lock, MoreVertical, Pin, Trash2, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

// 1. Tipe Data
interface NoteItem {
  id: string;
  type: string;
  title: string;
  content: string;
  category: string | null;
  date: string;
  image: string | null;
  isPinned: boolean;
}

// Mock Data (Nanti diganti fetch API)
const DUMMY_NOTES: NoteItem[] = [
    { id: '1', type: 'note', title: 'Belanja Bulanan', content: 'Daftar belanjaan untuk bulan ini: Susu, Telur, Roti...', category: 'Personal', date: '2023-10-25', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000', isPinned: true },
    { id: '2', type: 'note', title: 'Ide Konten Instagram', content: '1. Tips keuangan, 2. Review buku...', category: 'Work', date: '2023-10-24', image: null, isPinned: false },
    { id: '3', type: 'locked', title: 'Secret Password', content: '...', category: null, date: '2023-10-20', image: null, isPinned: false },
    { id: '4', type: 'note', title: 'Resep Kue Coklat', content: 'Tepung terigu 200g, Coklat bubuk 50g...', category: 'Cooking', date: '2023-10-18', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?auto=format&fit=crop&q=80&w=1000', isPinned: false },
    { id: '5', type: 'note', title: 'Jadwal Meeting', content: 'Senin: Team Lead, Selasa: Client...', category: 'Work', date: '2023-10-15', image: null, isPinned: false },
];

export default function NotesPage() {
  const [items, setItems] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Simulasi Fetch
  useEffect(() => {
    // Nanti ganti fetch('/api/notes')
    setTimeout(() => {
        setItems(DUMMY_NOTES);
        setIsLoading(false);
    }, 1000);
  }, []);

  // Filter Logic
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

  // Handlers
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete note?")) {
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

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-zinc-400 tracking-widest uppercase">Loading Notes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans pb-32">
      
      {/* 1. HEADER: Clean & Sticky */}
      <div className="sticky top-0 z-30 bg-zinc-50/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Notes.</h1>
            <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
            </div>
        </div>

        {/* Search Bar (Floating) */}
        <div className="px-6 pb-4">
             <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Search your thoughts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-300 transition-all shadow-sm placeholder:text-zinc-400"
                />
             </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-6">
        
        {/* 2. PINNED NOTE (Hero Card Style) */}
        {pinnedItem && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-1">Pinned Note</h2>
            <div className="relative group overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-zinc-200/50 border border-zinc-100 aspect-[4/3] sm:aspect-[21/9]">
                
                {/* Image Background */}
                <div className="absolute inset-0">
                    <img 
                        src={pinnedItem.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop'} 
                        alt="Pinned" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                         {pinnedItem.category && (
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                {pinnedItem.category}
                            </span>
                         )}
                         <div className="flex items-center gap-1 text-[10px] opacity-70">
                            <Calendar size={10} /> {formatDate(pinnedItem.date)}
                         </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">{pinnedItem.title}</h3>
                    <p className="text-sm text-zinc-300 line-clamp-2 max-w-xl opacity-90">{pinnedItem.content}</p>
                </div>

                {/* Actions (Top Right) */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                        onClick={(e) => handleTogglePin(pinnedItem.id, e)}
                        className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors border border-white/10"
                    >
                        <Pin size={16} className="fill-white" />
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* 3. MASONRY GRID (Other Notes) */}
        <div>
           <div className="flex items-center justify-between mb-4 px-1">
             <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Notes</h2>
             <span className="text-xs text-zinc-400">{gridItems.length} items</span>
           </div>

           <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {gridItems.map((item) => (
                 <div key={item.id} className="break-inside-avoid">
                    {item.type === 'locked' ? (
                        // LOCKED CARD
                        <div className="h-40 bg-zinc-100 rounded-3xl p-6 flex flex-col items-center justify-center text-zinc-400 border border-zinc-200">
                             <Lock size={24} className="mb-2 opacity-50" />
                             <span className="text-xs font-medium">Locked Note</span>
                        </div>
                    ) : (
                        // STANDARD CARD
                        <div 
                            className="group relative bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden"
                            onClick={() => console.log('Open detail', item.id)}
                        >
                            {/* Menu Trigger */}
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                                    className="p-1.5 bg-white/80 hover:bg-zinc-100 backdrop-blur rounded-full text-zinc-500 shadow-sm border border-zinc-100"
                                >
                                    <MoreVertical size={14} />
                                </button>
                                {activeMenuId === item.id && (
                                    <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-zinc-100 py-1 text-xs font-medium z-20 animate-in fade-in zoom-in-95">
                                        <button onClick={(e) => handleTogglePin(item.id, e)} className="w-full text-left px-3 py-2 hover:bg-zinc-50 flex items-center gap-2"><Pin size={12} /> Pin Note</button>
                                        <button onClick={(e) => handleDelete(item.id, e)} className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-500 flex items-center gap-2"><Trash2 size={12} /> Delete</button>
                                    </div>
                                )}
                            </div>

                            {/* Image Preview (If any) */}
                            {item.image && (
                                <div className="mb-3 -mx-5 -mt-5 h-32 overflow-hidden">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Content */}
                            <div>
                                <h3 className="font-bold text-zinc-900 leading-snug mb-1.5">{item.title}</h3>
                                <p className="text-xs text-zinc-500 line-clamp-4 leading-relaxed">
                                    {item.content || "No text content."}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-50">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                                    !item.category ? 'bg-zinc-50 text-zinc-400' : 'bg-zinc-900 text-white'
                                }`}>
                                    {item.category || 'Uncategorized'}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-medium">{formatDate(item.date)}</span>
                            </div>
                        </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* Empty State */}
        {gridItems.length === 0 && !pinnedItem && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <Search className="w-12 h-12 text-zinc-300 mb-4" />
                <p className="text-sm font-medium">No notes found.</p>
            </div>
        )}

      </div>

      {/* FAB: Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="group w-14 h-14 bg-zinc-900 text-white rounded-[1.2rem] shadow-xl shadow-zinc-400/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300">
            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
        </button>
      </div>

    </div>
  );
}