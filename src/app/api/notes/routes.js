// app/api/notes/route.js
import { NextResponse } from 'next/server';
import { getNotes } from '@/lib/notes';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notes = await getNotes();
    
    // DEBUG: Cek di terminal apakah data berhasil diambil
    console.log("Data dari Notion:", notes); 

    return NextResponse.json(notes);
  } catch (error) {
    // DEBUG: Cek error di terminal
    console.error("Error di API Route:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}