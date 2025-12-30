import {
  ShoppingCart,
  Home,
  User,
  Car,
  Utensils,
  Gamepad2,
  HeartPulse,
  Shirt,
  Wallet,
  GraduationCap,
  Gift,
  Dumbbell,
  Globe,
  Sparkles,
  ClipboardList,
  BadgeDollarSign,
  Coins,
  MoreHorizontal,
  Clapperboard,
  ShoppingBag
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ICON_MAP: Record<string, any> = {
  "Household Items": Home,
  "Personal Care": User,
  "Groceries": ShoppingCart,
  "Utilities": ClipboardList,
  "Food & Drink": Utensils,
  "Digital Recreation": Clapperboard,
  "Hobbies & Recreation": Sparkles,
  "Transport": Car,
  "Savings": Coins,
  "Shopping": ShoppingBag,
  "Health & Wellness": HeartPulse,
  "Laundry Services": Shirt,
  "Google Services": Globe,
  "Game Items": Gamepad2,
  "Fitnes & Sport": Dumbbell,
  "Education": GraduationCap,
  "Fashion & Accesories": Shirt,
  "Miscellaneous": MoreHorizontal,
  "Cash Withdrawals": Wallet,
  "Work & Office Supplies": ClipboardList,
  "Gift & Donations": Gift,
  "Vehicle Expenses": Car,
  "Taxes & Fee": BadgeDollarSign,
  "Digital Gaming Expenses": Gamepad2,
  "default": MoreHorizontal,
};

export const CATEGORY_IDS: Record<string, string> = {
  "Household Items": "27c9ec9fc1ce81b0bb32f1192af81c25",
  "Personal Care": "27c9ec9fc1ce80699d2dca5db147db43",
  "Groceries": "27c9ec9fc1ce81db8b45eaf428d7d508",
  "Utilities": "27c9ec9fc1ce81daae52c27d608dee57",
  "Food & Drink": "27c9ec9fc1ce814d9aedfa7c0772fabd",
  "Digital Recreation": "27c9ec9fc1ce81bc82dbedf3bd4f9929",
  "Hobbies & Recreation": "27d9ec9fc1ce80dcb890c9394ff811ad",
  "Transport": "27c9ec9fc1ce8111b59cc3f9f0e3d167",
  "Savings": "27c9ec9fc1ce8111b59cc3f9f0e3d167",
  "Shopping": "27c9ec9fc1ce81999aeaf7c3af0521d6",
  "Health & Wellness": "27c9ec9fc1ce81128c5ffbe7b6eb31fb",
  "Laundry Services": "27c9ec9fc1ce8053939dfab94ce2b7d4",
  "Google Services": "27c9ec9fc1ce804a8d30cad0eb83bfd1",
  "Game Items": "27c9ec9fc1ce8083a798c5da83ca430c",
  "Fitnes & Sport": "27c9ec9fc1ce80edb8bdc87411ac889a",
  "Education": "27c9ec9fc1ce8045b4a8c27f91f1847e",
  "Fashion & Accesories": "27c9ec9fc1ce8020ba30d56693969372",
  "Miscellaneous": "27c9ec9fc1ce803286fdf9470e527e6b",
  "Cash Withdrawals": "27c9ec9fc1ce80a2928be38ce4634fa3",
  "Work & Office Supplies": "27c9ec9fc1ce806e9e22dfa8cd0741fb",
  "Gift & Donations": "27d9ec9fc1ce80e19262e91d85643d73",
  "Vehicle Expenses": "27d9ec9fc1ce80acb3cfe3379f5587b6",
  "Taxes & Fee": "27d9ec9fc1ce80dd8ad4d7c4c73a1d18",
  "Digital Gaming Expenses": "27e9ec9fc1ce80a6a44cf44db2377746",
};

export const CATEGORY_GROUPS: Record<string, string[]> = {
  "Kebutuhan Harian": [
    "Groceries",
    "Food & Drink",
    "Personal Care",
    "Household Items",
    "Fashion & Accesories",
  ],
  "Tagihan & Layanan": [
    "Utilities",
    "Laundry Services",
    "Education",
    "Work & Office Supplies",
    "Taxes & Fee",
    "Health & Wellness",
    "Fitnes & Sport",
  ],
  "Digital & Hiburan": [
    "Digital Recreation",
    "Game Items",
    "Digital Gaming Expenses",
    "Google Services",
    "Hobbies & Recreation",
  ],
  "Transportasi": [
    "Transport",
    "Vehicle Expenses",
  ],
  "Keuangan & Lainnya": [
    "Savings",
    "Shopping",
    "Cash Withdrawals",
    "Gift & Donations",
    "Miscellaneous",
  ]
};

export const PLATFORM_IDS: Record<string, string> = {
  "TikTok Shop": "27c9ec9fc1ce803fab83fa38ceb4c046",
  "Shopee-Food": "27c9ec9fc1ce8096b1d1eb04f660acd0",
  "Tokopedia": "27c9ec9fc1ce80599e17c97ae8cb5704",
  "Shopee": "27c9ec9fc1ce8045b4a8c27f91f1847e",
  "Gojek": "27c9ec9fc1ce80b7a071d27091e687ad",
  "Grab": "27c9ec9fc1ce80468320cbb8be5f52ad",

  "Caffee & Restaurant": "27c9ec9fc1ce80e58733fc25c83f248f",
  "Store & Minimarket": "27c9ec9fc1ce808ab85dc249444c2e02",
  "Gas Station": "27c9ec9fc1ce80aa81d3e73b035e419a",
  "Food Court": "27c9ec9fc1ce80468781df2c1e0c0de6",

  "Klik Indomaret": "2ab9ec9fc1ce80f58cc0ead18c78023f",
  "Access By KAI": "27c9ec9fc1ce8015ad7bfd39a0700fed",
  "MyPertamina": "27c9ec9fc1ce8092b78dd97fd2632960",
  "MyTelkomsel": "27c9ec9fc1ce800f9389c7766455ba98",
  "CGV Cinema": "27c9ec9fc1ce810fb495d3b9e8386f0d",
  "Steam": "27c9ec9fc1ce8039a00dc7ffd989f43e",
  "Tiket.com": "27c9ec9fc1ce808aa93fd0f283f5cc67",

  "Website Platform": "27d9ec9fc1ce8068ad9fe1ae5d7e8d58",
  "Online Platform": "27d9ec9fc1ce80e6a89fc1ce59c98a7b",
  "Offline/Warung": "27d9ec9fc1ce80d28fecc5595ef6bed3",
  "App Store": "27c9ec9fc1ce8018bf6cfd3d6e91966b",
  "Google Services": "27d9ec9fc1ce8051bdb2f714b193ef32",
};

export const PLATFORM_GROUPS: Record<string, string[]> = {
  "Marketplace": [
    "TikTok Shop",
    "Shopee",
    "Tokopedia",
    "Shopee-Food",
    "Tiket.com",
    "Steam"
  ],
  "Transport": [
    "Gojek",
    "Grab",
    "Access By KAI"
  ],
  "Makanan / Tempat": [
    "Caffee & Restaurant",
    "Food Court",
    "Store & Minimarket",
    "Gas Station"
  ],
  "Apps & Layanan": [
    "MyPertamina",
    "MyTelkomsel",
    "Klik Indomaret",
    "Google Services",
    "App Store",
    "Online Platform",
    "Website Platform",
  ],
  "Offline": [
    "Offline/Warung"
  ]
};

// PAYMENT LIST (flat)
export const PAYMENT_METHODS = [
  "Bank Central Asia",
  "Cash",
  "Seabank",
  "Link Aja"
];

// GROUPED PAYMENT (untuk SelectGroup)
export const PAYMENT_GROUPS: Record<string, string[]> = {
  "Bank": [
    "Bank Central Asia",
    "Seabank",
  ],
  "eWallet": [
    "Link Aja"
  ],
  "Tunai": [
    "Cash"
  ]
};