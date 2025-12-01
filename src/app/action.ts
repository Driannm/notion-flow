// src/app/actions.ts
'use server'

import { notion, DATABASE_ID } from "@/lib/notion";
import { CATEGORY_IDS, PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function addExpense(formData: FormData) {
  // Helper buat ambil angka, default 0 kalo kosong
  const getNumber = (key: string) => {
    const val = formData.get(key);
    return val ? parseInt(val.toString()) : 0;
  };

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const categoryName = formData.get("category") as string;
  const platformName = formData.get("platform") as string;

  // Angka-angka
  const subtotal = getNumber("subtotal");
  const shipping = getNumber("shipping");
  const discount = getNumber("discount");
  const serviceFee = getNumber("serviceFee");
  const additionalFee = getNumber("additionalFee");

  // Logic Total (Amount) = (Sub + Ship + Serv + Add) - Disc
  const totalAmount = (subtotal + shipping + serviceFee + additionalFee) - discount;

  const categoryId = CATEGORY_IDS[categoryName];
  const platformId = PLATFORM_IDS[platformName];

  if (!name || totalAmount <= 0 || !categoryId) {
    return { success: false, message: "Nama, Harga, & Kategori wajib diisi!" };
  }

  try {
    const properties: any = {
      "Name": { title: [{ text: { content: name } }] },
      "Date": { date: { start: dateStr || new Date().toISOString() } },
      "Category": { relation: [{ id: categoryId }] },
      "Payment Method": { select: { name: paymentMethod } },
      
      // Angka-angka masuk ke Notion
      "Amount": { number: totalAmount }, // Total Akhir
      "Subtotal": { number: subtotal },
      "Shipping": { number: shipping },
      "Discount": { number: discount },
      "Service Fee": { number: serviceFee },
      "Additional Fee": { number: additionalFee },
    };

    if (platformName && platformId) {
      properties["Platform / Store"] = { relation: [{ id: platformId }] };
    }

    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties: properties,
    });

    revalidatePath("/");
    return { success: true, message: "Tersimpan! 🎉" };
  } catch (error: any) {
    console.error(JSON.stringify(error, null, 2));
    return { success: false, message: error.message };
  }
}