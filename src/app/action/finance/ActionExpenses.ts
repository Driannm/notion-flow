/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { notion, DATABASE_ID } from "@/lib/notion-server";
import { CATEGORY_IDS, PLATFORM_IDS } from "@/lib/constants";
import { revalidatePath } from "next/cache";

/* ======================================================
   HELPERS
====================================================== */

// Format Date ke WIB (UTC+7)
const getJakartaDate = (dateStr?: string) => {
  const date = dateStr ? new Date(dateStr) : new Date();
  const jakartaOffset = 7 * 60 * 60 * 1000;
  const jakartaTime = new Date(date.getTime() + jakartaOffset);
  return jakartaTime.toISOString().replace("Z", "+07:00");
};

// Bersihkan strip UUID
const normalizeId = (id: string) => id.replace(/-/g, "");

// Map ID -> Nama Category
const ID_TO_CATEGORY = Object.entries(CATEGORY_IDS).reduce(
  (acc, [name, id]) => {
    acc[normalizeId(id)] = name;
    return acc;
  },
  {} as Record<string, string>
);

// Map ID -> Nama Platform
const ID_TO_PLATFORM = Object.entries(PLATFORM_IDS).reduce(
  (acc, [name, id]) => {
    acc[normalizeId(id)] = name;
    return acc;
  },
  {} as Record<string, string>
);

/* ======================================================
   ADD EXPENSE
====================================================== */

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

  const totalAmount =
    subtotal + shipping + serviceFee + additionalFee - discount;

  const categoryId = CATEGORY_IDS[categoryName];
  const platformId = PLATFORM_IDS[platformName];

  if (!name || totalAmount <= 0 || !categoryId) {
    return {
      success: false,
      message: "Nama, kategori, dan total wajib diisi!",
    };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
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
      properties["Platform / Store"] = {
        relation: [{ id: platformId }],
      };
    }

    await notion.pages.create({
      parent: { database_id: DATABASE_ID },
      properties,
    });

    revalidatePath("/finance/expenses");

    return { success: true, message: "Pengeluaran berhasil disimpan!" };
  } catch (error: any) {
    console.error("Add Error:", error);
    return { success: false, message: error.message };
  }
}

/* ======================================================
   GET EXPENSES (2 Bulan Terakhir)
====================================================== */

export async function getExpenses() {
  try {
    const now = new Date();
    const prevMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const startOfFilterStr = prevMonthDate
      .toISOString()
      .split("T")[0];

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      page_size: 100,
      filter: {
        property: "Date",
        date: {
          on_or_after: startOfFilterStr,
        },
      },
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    });

    const transactions = response.results.map((page: any) => {
      const props = page.properties;

      const rawCatId = props.Category?.relation?.[0]?.id;
      let categoryName = "Miscellaneous";

      if (rawCatId) {
        const cleanCatId = normalizeId(rawCatId);
        if (ID_TO_CATEGORY[cleanCatId]) {
          categoryName = ID_TO_CATEGORY[cleanCatId];
        }
      }

      const dateRaw = props.Date?.date?.start;
      const dateObj = dateRaw ? new Date(dateRaw) : new Date();

      const formattedDate = dateObj.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      });

      const shipping = props.Shipping?.number || 0;
      const serviceFee = props["Service Fee"]?.number || 0;
      const additionalFee = props["Additional Fee"]?.number || 0;
      const totalFee = shipping + serviceFee + additionalFee;

      return {
        id: page.id,
        title: props.Name?.title?.[0]?.plain_text || "Untitled",
        category: categoryName,
        amount: props.Amount?.number || 0,
        date: formattedDate,
        dateObj,
        paymentMethod:
          props["Payment Method"]?.select?.name || "Cash",
        subtotal: props.Subtotal?.number || 0,
        discount: props.Discount?.number || 0,
        fee: totalFee,
      };
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { success: false, data: [] };
  }
}

/* ======================================================
   GET DETAIL BY ID
====================================================== */

export async function getExpenseById(id: string) {
  try {
    const page: any = await notion.pages.retrieve({
      page_id: id,
    });

    const props = page.properties;

    // Category
    const rawCatId = props.Category?.relation?.[0]?.id;
    let categoryName = "Miscellaneous";
    if (rawCatId) {
      const cleanCatId = normalizeId(rawCatId);
      if (ID_TO_CATEGORY[cleanCatId])
        categoryName = ID_TO_CATEGORY[cleanCatId];
    }

    // Platform
    const rawPlatId =
      props["Platform / Store"]?.relation?.[0]?.id;
    let platformName = "-";
    if (rawPlatId) {
      const cleanPlatId = normalizeId(rawPlatId);
      if (ID_TO_PLATFORM[cleanPlatId])
        platformName = ID_TO_PLATFORM[cleanPlatId];
    }

    const dateRaw = props.Date?.date?.start;
    const dateObj = dateRaw ? new Date(dateRaw) : new Date();

    const fullDate = dateObj.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const time = dateObj.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return {
      success: true,
      data: {
        id: page.id,
        title:
          props.Name?.title?.[0]?.plain_text || "Untitled",
        amount: props.Amount?.number || 0,
        category: categoryName,
        platform: platformName,
        date: fullDate,
        time,
        paymentMethod:
          props["Payment Method"]?.select?.name || "Cash",
        subtotal: props.Subtotal?.number || 0,
        shipping: props.Shipping?.number || 0,
        serviceFee:
          props["Service Fee"]?.number || 0,
        additionalFee:
          props["Additional Fee"]?.number || 0,
        discount: props.Discount?.number || 0,
      },
    };
  } catch (error) {
    console.error("Detail Error:", error);
    return { success: false, data: null };
  }
}

/* ======================================================
   UPDATE
====================================================== */

export async function updateExpense(
  pageId: string,
  formData: FormData
) {
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

  const totalAmount =
    subtotal + shipping + serviceFee + additionalFee - discount;

  const categoryId = CATEGORY_IDS[categoryName];
  const platformId = PLATFORM_IDS[platformName];

  if (!name || totalAmount <= 0) {
    return {
      success: false,
      message: "Nama dan total valid wajib diisi.",
    };
  }

  try {
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Date: { date: { start: getJakartaDate(dateStr) } },
      "Payment Method": { select: { name: paymentMethod } },
      Amount: { number: totalAmount },
      Subtotal: { number: subtotal },
      Shipping: { number: shipping },
      Discount: { number: discount },
      "Service Fee": { number: serviceFee },
      "Additional Fee": { number: additionalFee },
    };

    if (categoryId) {
      properties.Category = {
        relation: [{ id: categoryId }],
      };
    }

    if (platformId) {
      properties["Platform / Store"] = {
        relation: [{ id: platformId }],
      };
    }

    await notion.pages.update({
      page_id: pageId,
      properties,
    });

    revalidatePath("/finance/expenses");

    return {
      success: true,
      message: "Pengeluaran berhasil diupdate!",
    };
  } catch (error: any) {
    console.error("Update Error:", error);
    return { success: false, message: error.message };
  }
}

/* ======================================================
   DELETE (Soft Delete)
====================================================== */

export async function deleteExpense(
  id: string
): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true,
    });

    revalidatePath("/finance/expenses");

    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return {
      success: false,
      message: "Failed to delete",
    };
  }
}