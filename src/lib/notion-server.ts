import { Client } from "@notionhq/client";

export const notion = new Client({
  auth: process.env.NOTION_KEY,
});

export const DATABASE_ID = process.env.EXPENSES_DATABASE_ID!;
export const TEMPLATE_DATABASE_ID = process.env.EXPENSES_TEMPLATE_DATABASE_ID!;
export const INCOME_DATABASE_ID = process.env.INCOME_DATABASE_ID!;