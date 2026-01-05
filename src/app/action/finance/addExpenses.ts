/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion, DATABASE_ID } from "@/lib/notion-server";
import { CATEGORY_IDS, PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

// --- HELPER: FORMAT DATE TO JAKARTA (WIB / UTC+7) ---
const getJakartaDate = (dateStr?: string) => {
  // 1. Jika ada input dateStr, pakai itu. Jika tidak, pakai waktu sekarang.
  const date = dateStr ? new Date(dateStr) : new Date();

  // 2. Hitung Offset Jakarta (UTC+7) dalam milidetik
  // 7 jam * 60 menit * 60 detik * 1000 ms
  const jakartaOffset = 7 * 60 * 60 * 1000;

  // 3. Buat object date baru yang sudah digeser waktunya seolah-olah UTC adalah WIB
  const userTime = date.getTime();
  const jakartaTime = new Date(userTime + jakartaOffset);

  // 4. Ambil ISO String, tapi buang 'Z' di belakang dan ganti '+07:00'
  // Contoh hasil: "2023-10-25T19:30:00.000+07:00"
  return jakartaTime.toISOString().replace("Z", "+07:00");
};

// --- ADD EXPENSE ---
export async function addExpense(formData: FormData) {
  const getNumber = (key: string) => {
    const val = formData.get(key);
    return val ? parseInt(val.toString()) : 0;
  };

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const categoryName = formData.get("category") as string;
  const platformName = formData.get("platform") as string;

  const subtotal = getNumber("subtotal");
  const shipping = getNumber("shipping");
  const discount = getNumber("discount");
  const serviceFee = getNumber("serviceFee");
  const additionalFee = getNumber("additionalFee");

  const totalAmount = (subtotal + shipping + serviceFee + additionalFee) - discount;

  const categoryId = CATEGORY_IDS[categoryName];
  const platformId = PLATFORM_IDS[platformName];

  if (!name || totalAmount <= 0 || !categoryId) {
    return { success: false, message: "Nama, kategori, dan total wajib diisi!" };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      // 👇 PERBAIKAN: Gunakan helper getJakartaDate
      Date: { date: { start: getJakartaDate(dateStr) } },
      Category: { relation: [{ id: categoryId }] },
      "Payment Method": { select: { name: paymentMethod } },
      Amount: { number: totalAmount },
      Subtotal: { number: subtotal },
      Shipping: { number: shipping },
      Discount: { number: discount },
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
    return { success: true, message: "Pengeluaran berhasil disimpan!" };
  } catch (error: any) {
    console.error("Error:", error);
    return { success: false, message: error.message };
  }
}