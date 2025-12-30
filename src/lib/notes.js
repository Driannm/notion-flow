// src/lib/notes.js

export const getNotes = async () => {
  const databaseId = process.env.NOTES_DATABASE_ID;
  const apiKey = process.env.NOTION_KEY;

  if (!databaseId || !apiKey) {
    throw new Error("❌ ID Database atau API Key belum diisi di .env.local");
  }

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sorts: [{ property: "Date", direction: "descending" }],
      }),
      next: { revalidate: 0 } // No cache biar perubahan langsung terlihat
    });

    if (!response.ok) {
      throw new Error(`Notion API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // --- 🕵️ DEBUGGING KOLOM (PENTING) ---
    if (data.results.length > 0) {
        const firstProp = data.results[0].properties;
        console.log("--------------------------------------------------");
        console.log("📋 NAMA KOLOM ASLI DI NOTION KAMU:");
        console.log(Object.keys(firstProp).join(", "));
        console.log("--------------------------------------------------");
        
        // Cek Detail Type & Category
        const typeProp = firstProp.Type || firstProp.type || firstProp.Tipe;
        console.log("🧐 Struktur Data 'Type':", JSON.stringify(typeProp, null, 2));
    }
    // ------------------------------------

    const cleanData = data.results.map((page) => {
      const props = page.properties;

      // 1. HELPER: Ambil Text/Title dengan aman
      const getText = (prop) => prop?.title?.[0]?.plain_text || prop?.rich_text?.[0]?.plain_text || "";
      
      // 2. HELPER: Ambil Select / Multi-Select dengan aman
      // Ini akan membaca baik tipe 'Select' maupun 'Multi-select'
      const getSelect = (prop) => {
        if (!prop) return null;
        if (prop.select) return prop.select.name; // Jika tipe Select
        if (prop.multi_select && prop.multi_select.length > 0) return prop.multi_select[0].name; // Jika tipe Multi-select
        return null;
      };

      // 3. VARIABEL PENAMPUNG (Cari berbagai kemungkinan nama kolom)
      // Cek apakah namanya 'Type', 'type', atau 'Tipe'
      const typeRaw = props.Type || props.type || props.Tipe;
      // Cek apakah namanya 'Category', 'category', atau 'Kategori'
      const categoryRaw = props.Category || props.category || props.Kategori;
      
      // Image Handling
      const imgProp = props.CoverImage || props["Cover Image"] || props.Image || props.Gambar;
      let coverUrl = null;
      if (imgProp?.files?.length > 0) {
        const file = imgProp.files[0];
        coverUrl = file.type === "file" ? file.file.url : file.external.url;
      }

      return {
        id: page.id,
        // Pakai helper getSelect tadi
        type: getSelect(typeRaw)?.toLowerCase() || 'note', 
        title: getText(props.Name || props.name || props.Judul) || "Untitled",
        content: getText(props.Summary || props.summary || props.Content),
        // Pakai helper getSelect tadi
        category: getSelect(categoryRaw), 
        date: props.Date?.date?.start || new Date().toISOString(),
        image: coverUrl,
        isPinned: props.Pinned?.checkbox || false,
        tasks: [],
        collaborators: 0
      };
    });

    return cleanData;

  } catch (error) {
    console.error("❌ ERROR FETCH:", error.message);
    throw error;
  }
};