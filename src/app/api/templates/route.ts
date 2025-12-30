// src/app/api/templates/route.ts
import { NextResponse } from "next/server";
import { notion, TEMPLATE_DATABASE_ID } from "@/lib/notion-server";

export async function GET() {
  try {
    if (!TEMPLATE_DATABASE_ID) {
      return NextResponse.json(
        { message: "Missing EXPENSES_TEMPLATE_DATABASE_ID" },
        { status: 500 }
      );
    }

    const response = await notion.databases.query({
      database_id: TEMPLATE_DATABASE_ID,
      sorts: [{ property: "Name", direction: "ascending" }],
    });

    const templates = response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text ?? "",
      category: page.properties.Category?.select?.name ?? "", // Tidak ada di DB
      platform: page.properties.Platform?.select?.name ?? "", // Tidak ada di DB
      paymentMethod: page.properties["Payment Method"]?.select?.name ?? "",
      subtotal: page.properties.Subtotal?.number ?? 0, // ✅ FIXED
      shipping: page.properties.Shipping?.number ?? 0,
      discount: page.properties.Discount?.number ?? 0,
      serviceFee: page.properties["Service Fee"]?.number ?? 0,
      additionalFee: page.properties["Additional Payment"]?.number ?? 0, // ✅ FIXED
      amount: page.properties.Amount?.number ?? 0, // ✅ TAMBAHAN
    }));

    return NextResponse.json(templates);
    
  } catch (error) {
    console.error("TEMPLATE API ERROR:", error);
    return NextResponse.json(
      { message: "Failed to load templates", error: String(error) },
      { status: 500 }
    );
  }
}