import { Client } from "@notionhq/client";

if (!process.env.NOTION_KEY) {
  throw new Error("MISSING: NOTION_KEY is not defined in environment variables");
}

export const notion = new Client({
  auth: process.env.NOTION_KEY,
});

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    // Ini akan muncul di log production kamu jika variabel hilang
    console.error(`🚨 Critical Error: Environment variable ${key} is missing!`);
    return "MISSING_ID"; 
  }
  return value;
};

// existing exports (unchanged)
export const DATABASE_ID = getEnv("EXPENSES_DATABASE_ID");
export const CARD_DATABASE_ID = getEnv("CARD_DATABASE_ID");
export const INCOME_DATABASE_ID = getEnv("INCOME_DATABASE_ID");
export const TRANSFERS_DATABASE_ID = getEnv("TRANSFERS_DATABASE_ID");

export const NOTES_DATABASE_ID = process.env.NOTES_DATABASE_ID!;