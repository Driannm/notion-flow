// src/lib/getExpenseTemplates.ts
import { notion } from "@/lib/notion-server";

export async function getExpenseTemplates(databaseId: string) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [{ property: "Name", direction: "ascending" }],
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: page.properties.Name?.title?.[0]?.plain_text ?? "",
      category: page.properties.Category?.select?.name ?? "",
      platform: page.properties.Platform?.select?.name ?? "",
      paymentMethod: page.properties["Payment Method"]?.select?.name ?? "",
      subtotal: page.properties["Default Subtotal"]?.number ?? 0,
      shipping: page.properties.Shipping?.number ?? 0,
      discount: page.properties.Discount?.number ?? 0,
      serviceFee: page.properties["Service Fee"]?.number ?? 0,
      additionalFee: page.properties["Additional Fee"]?.number ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
}