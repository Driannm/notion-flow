/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion, DATABASE_ID } from "@/lib/notion-server";
import { CATEGORY_IDS, PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

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

  const iconData = formData.get("icon") as string;

  const subtotal = getNumber("subtotal");
  const shipping = getNumber("shipping");
  const discount = getNumber("discount");
  const serviceFee = getNumber("serviceFee");
  const additionalFee = getNumber("additionalFee");

  const totalAmount = (subtotal + shipping + serviceFee + additionalFee) - discount;

  const categoryId = CATEGORY_IDS[categoryName];
  const platformId = PLATFORM_IDS[platformName];

  if (!name || totalAmount <= 0 || !categoryId) {
    return { success: false, message: "Nama, kategori, dan total wajib diisi." };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Date: { date: { start: dateStr || new Date().toISOString() } },
      Category: { relation: [{ id: categoryId }] },
      "Payment Method": { select: { name: paymentMethod } },
      Amount: { number: totalAmount },
      Subtotal: { number: subtotal },
      Shipping: { number: shipping },
      Discount: { number: discount },
      "Service Fee": { number: serviceFee },
      "Additional Fee": { number: additionalFee }, // ✅ SESUAIKAN DENGAN NOTION
    };

    if (platformName && platformId) {
      properties["Platform / Store"] = { relation: [{ id: platformId }] };
    }

    // ✅ Parse dan set icon
    // let icon: any = undefined;
    // if (iconData) {
    //   try {
    //     const parsedIcon = JSON.parse(iconData);
    //     if (parsedIcon.type === "emoji") {
    //       icon = { emoji: parsedIcon.emoji };
    //     } else if (parsedIcon.type === "external") {
    //       icon = { external: { url: parsedIcon.url } };
    //     }
    //   } catch (e) {
    //     console.warn("Failed to parse icon:", e);
    //   }
    // }

    // await notion.pages.create({
    //   parent: { database_id: DATABASE_ID },
    //   properties: properties,
    //   icon: icon, // ✅ Set icon
    // });

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