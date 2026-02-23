"use server";

import { notion } from "@/lib/notion-server";

const CARD_DATABASE_ID = process.env.CARD_DATABASE_ID!;
const TRANSFERS_DATABASE_ID = process.env.TRANSFERS_DATABASE_ID!;

export async function getWalletData() {
  /* =======================
     FETCH CARDS
  ======================== */
  const cardResponse = await notion.databases.query({
    database_id: CARD_DATABASE_ID,
  });

  const cards = cardResponse.results.map((page: any) => {
    const props = page.properties;

    return {
      id: page.id,
      name: props.Name.title[0]?.plain_text || "Unnamed",
      type: props.Type.select?.name || "ATM",
      owner: props.Stackholder.multi_select[0]?.name || "-",
      balance: props["Current Balance"].formula.number || 0,
      bgColor:
        props["BG Color"]?.rich_text[0]?.plain_text || "#111827",
      textColor:
        props["Text Color"]?.rich_text[0]?.plain_text || "#FFFFFF",
    };
  });

  /* =======================
     BUILD CARD MAP (NO N+1)
  ======================== */
  const cardMap: Record<string, string> = {};
  cards.forEach((card) => {
    cardMap[card.id] = card.name;
  });

  /* =======================
     FETCH TRANSFERS
  ======================== */
  const transferResponse = await notion.databases.query({
    database_id: TRANSFERS_DATABASE_ID,
    sorts: [
      {
        property: "Date",
        direction: "descending",
      },
    ],
  });

  const transfers = transferResponse.results.map((page: any) => {
    const props = page.properties;

    const fromId = props["From Account"].relation[0]?.id;
    const toId = props["To Account"].relation[0]?.id;

    return {
      id: page.id,
      from: cardMap[fromId] || "-",
      to: cardMap[toId] || "-",
      amount:
        props["Total Deduction"].formula.number || 0,
      date: props.Date.date?.start || "",
    };
  });

  return { cards, transfers };
}