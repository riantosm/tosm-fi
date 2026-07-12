export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiPayloadField {
  name: string;
  type: string;
  required: boolean;
}

export interface ApiEndpointDoc {
  id: string;
  title: string;
  method: HttpMethod;
  endpoint: string;
  payload: ApiPayloadField[];
  successExample: string;
  errorExample: string;
}

export interface ApiDocGroup {
  key: string;
  titleKey: string;
  endpoints: ApiEndpointDoc[];
}

export const API_DOC_GROUPS: ApiDocGroup[] = [
  {
    key: "auth",
    titleKey: "apiDoc.groups.auth",
    endpoints: [
      {
        id: "login",
        title: "Login",
        method: "POST",
        endpoint: "/auth/login",
        payload: [
          { name: "username", type: "string", required: true },
          { name: "password", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Login berhasil",
            data: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                idUser: "1",
                nameUser: "John Doe",
                username: "johndoe",
              },
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Username atau password salah",
          },
          null,
          2,
        ),
      },
      {
        id: "get-user",
        title: "Get User",
        method: "GET",
        endpoint: "/auth/me",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            data: {
              idUser: "1",
              nameUser: "John Doe",
              username: "johndoe",
              netWorth: 0,
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "logout",
        title: "Logout",
        method: "POST",
        endpoint: "/auth/logout",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Logout berhasil",
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    key: "wallet",
    titleKey: "apiDoc.groups.wallet",
    endpoints: [
      {
        id: "list-wallets",
        title: "List Wallets",
        method: "GET",
        endpoint: "/wallets",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                idWallet: "wallet-1",
                nameWallet: "Cash",
                color: "#a16207",
                balance: 850000,
                transactionCount: 42,
                isPrimary: true,
              },
            ],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "create-wallet",
        title: "Create Wallet",
        method: "POST",
        endpoint: "/wallets",
        payload: [
          { name: "nameWallet", type: "string", required: true },
          { name: "color", type: "string", required: true },
          { name: "balance", type: "number", required: false },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet berhasil dibuat",
            data: {
              idWallet: "wallet-6",
              nameWallet: "Dana Liburan",
              color: "#075985",
              balance: 0,
              transactionCount: 0,
              isPrimary: false,
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Nama wallet wajib diisi",
          },
          null,
          2,
        ),
      },
      {
        id: "update-wallet",
        title: "Update Wallet",
        method: "PATCH",
        endpoint: "/wallets/:idWallet",
        payload: [
          { name: "nameWallet", type: "string", required: true },
          { name: "color", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet berhasil diperbarui",
            data: {
              idWallet: "wallet-6",
              nameWallet: "Dana Liburan 2027",
              color: "#3f6212",
              balance: 0,
              transactionCount: 0,
              isPrimary: false,
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Wallet tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "delete-wallet",
        title: "Delete Wallet",
        method: "DELETE",
        endpoint: "/wallets/:idWallet",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet berhasil dihapus",
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Wallet tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "set-primary-wallet",
        title: "Set Primary Wallet",
        method: "PATCH",
        endpoint: "/wallets/:idWallet/primary",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet utama berhasil diubah",
            data: [
              { idWallet: "wallet-1", isPrimary: false },
              { idWallet: "wallet-6", isPrimary: true },
            ],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Wallet tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "reorder-wallets",
        title: "Reorder Wallets",
        method: "PATCH",
        endpoint: "/wallets/reorder",
        payload: [{ name: "orderedIds", type: "string[]", required: true }],
        successExample: JSON.stringify(
          {
            success: true,
            data: [{ idWallet: "wallet-6" }, { idWallet: "wallet-1" }],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    key: "category",
    titleKey: "apiDoc.groups.category",
    endpoints: [
      {
        id: "list-categories",
        title: "List Categories",
        method: "GET",
        endpoint: "/categories",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                idCategory: "category-1",
                nameCategory: "Makan",
                type: "expense",
                color: "#E2574C",
                icon: "HiOutlineCake",
                transactionCount: 12,
                subCategories: [
                  {
                    idSubCategory: "subcategory-1",
                    idCategory: "category-1",
                    nameSubCategory: "Warteg",
                    icon: "HiOutlineBuildingStorefront",
                    transactionCount: 5,
                  },
                ],
              },
            ],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "create-category",
        title: "Create Category",
        method: "POST",
        endpoint: "/categories",
        payload: [
          { name: "nameCategory", type: "string", required: true },
          { name: "type", type: '"income" | "expense"', required: true },
          { name: "color", type: "string", required: true },
          { name: "icon", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Kategori berhasil dibuat",
            data: {
              idCategory: "category-2",
              nameCategory: "Gaji",
              type: "income",
              color: "#7CB87C",
              icon: "HiOutlineBriefcase",
              transactionCount: 0,
              subCategories: [],
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Nama kategori wajib diisi",
          },
          null,
          2,
        ),
      },
      {
        id: "update-category",
        title: "Update Category",
        method: "PATCH",
        endpoint: "/categories/:idCategory",
        payload: [
          { name: "nameCategory", type: "string", required: true },
          { name: "type", type: '"income" | "expense"', required: true },
          { name: "color", type: "string", required: true },
          { name: "icon", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Kategori berhasil diperbarui",
            data: {
              idCategory: "category-2",
              nameCategory: "Gaji Bulanan",
              type: "income",
              color: "#075985",
              icon: "HiOutlineBanknotes",
              transactionCount: 0,
              subCategories: [],
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Kategori tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "delete-category",
        title: "Delete Category",
        method: "DELETE",
        endpoint: "/categories/:idCategory",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Kategori berhasil dihapus",
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Kategori tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "reorder-categories",
        title: "Reorder Categories",
        method: "PATCH",
        endpoint: "/categories/reorder",
        payload: [{ name: "orderedIds", type: "string[]", required: true }],
        successExample: JSON.stringify(
          {
            success: true,
            data: [{ idCategory: "category-2" }, { idCategory: "category-1" }],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "create-subcategory",
        title: "Create Subcategory",
        method: "POST",
        endpoint: "/categories/:idCategory/subcategories",
        payload: [
          { name: "nameSubCategory", type: "string", required: true },
          { name: "icon", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Subkategori berhasil dibuat",
            data: {
              idSubCategory: "subcategory-2",
              idCategory: "category-1",
              nameSubCategory: "Restoran",
              icon: "HiOutlineBuildingStorefront",
              transactionCount: 0,
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Nama subkategori wajib diisi",
          },
          null,
          2,
        ),
      },
      {
        id: "update-subcategory",
        title: "Update Subcategory",
        method: "PATCH",
        endpoint: "/categories/:idCategory/subcategories/:idSubCategory",
        payload: [
          { name: "nameSubCategory", type: "string", required: true },
          { name: "icon", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Subkategori berhasil diperbarui",
            data: {
              idSubCategory: "subcategory-2",
              idCategory: "category-1",
              nameSubCategory: "Restoran Padang",
              icon: "HiOutlineBuildingStorefront",
              transactionCount: 0,
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Subkategori tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "delete-subcategory",
        title: "Delete Subcategory",
        method: "DELETE",
        endpoint: "/categories/:idCategory/subcategories/:idSubCategory",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Subkategori berhasil dihapus",
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Subkategori tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "reorder-subcategories",
        title: "Reorder Subcategories",
        method: "PATCH",
        endpoint: "/categories/:idCategory/subcategories/reorder",
        payload: [{ name: "orderedIds", type: "string[]", required: true }],
        successExample: JSON.stringify(
          {
            success: true,
            data: [{ idSubCategory: "subcategory-2" }, { idSubCategory: "subcategory-1" }],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    key: "transaction",
    titleKey: "apiDoc.groups.transaction",
    endpoints: [
      {
        id: "list-transactions",
        title: "List Transactions",
        method: "GET",
        endpoint: "/transactions?month=2026-07&idWallet=wallet-1&idCategory=category-1&idSubCategory=subcategory-1&dateFrom=2026-07-01&dateTo=2026-07-15&search=makan&sort=dateDesc",
        payload: [
          { name: "month", type: "string (YYYY-MM)", required: true },
          { name: "idWallet", type: "string", required: false },
          { name: "idCategory", type: "string", required: false },
          { name: "idSubCategory", type: "string", required: false },
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: false },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: false },
          { name: "search", type: "string", required: false },
          {
            name: "sort",
            type: '"dateDesc" | "dateAsc" | "amountDesc" | "amountAsc"',
            required: false,
          },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                idTransaction: "transaction-1",
                type: "expense",
                idWallet: "wallet-1",
                idCategory: "category-1",
                idSubCategory: "subcategory-1",
                idWalletFrom: null,
                idWalletTo: null,
                title: "Warteg nasi, ayam, toge",
                notes: "",
                amount: 17000,
                date: "2026-07-10T09:34:00.000Z",
              },
              {
                idTransaction: "transaction-2",
                type: "transfer",
                idWallet: null,
                idCategory: null,
                idSubCategory: null,
                idWalletFrom: "wallet-2",
                idWalletTo: "wallet-1",
                title: "Jago Transfer Out → Cash Transfer In",
                notes: "",
                amount: 100000,
                date: "2026-06-28T08:00:00.000Z",
              },
              {
                idTransaction: "transaction-3",
                type: "correction",
                idWallet: "wallet-1",
                idCategory: null,
                idSubCategory: null,
                idWalletFrom: null,
                idWalletTo: null,
                title: "Balance Correction",
                notes: "Penyesuaian saldo aktual",
                amount: 3000,
                date: "2026-06-25T07:00:00.000Z",
              },
            ],
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "create-transaction",
        title: "Create Transaction",
        method: "POST",
        endpoint: "/transactions",
        payload: [
          { name: "type", type: '"income" | "expense" | "transfer" | "correction"', required: true },
          { name: "idWallet", type: "string | null", required: false },
          { name: "idCategory", type: "string | null", required: false },
          { name: "idSubCategory", type: "string | null", required: false },
          { name: "idWalletFrom", type: "string | null", required: false },
          { name: "idWalletTo", type: "string | null", required: false },
          { name: "title", type: "string", required: false },
          { name: "notes", type: "string", required: false },
          { name: "amount", type: "number", required: true },
          { name: "date", type: "string (ISO 8601)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Transaksi berhasil ditambahkan",
            data: {
              idTransaction: "transaction-4",
              type: "expense",
              idWallet: "wallet-1",
              idCategory: "category-1",
              idSubCategory: "subcategory-1",
              idWalletFrom: null,
              idWalletTo: null,
              title: "Ngasih",
              notes: "",
              amount: 100000,
              date: "2026-07-10T10:00:00.000Z",
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Kategori wajib diisi",
          },
          null,
          2,
        ),
      },
      {
        id: "update-transaction",
        title: "Update Transaction",
        method: "PATCH",
        endpoint: "/transactions/:idTransaction",
        payload: [
          { name: "type", type: '"income" | "expense" | "transfer" | "correction"', required: true },
          { name: "idWallet", type: "string | null", required: false },
          { name: "idCategory", type: "string | null", required: false },
          { name: "idSubCategory", type: "string | null", required: false },
          { name: "idWalletFrom", type: "string | null", required: false },
          { name: "idWalletTo", type: "string | null", required: false },
          { name: "title", type: "string", required: false },
          { name: "notes", type: "string", required: false },
          { name: "amount", type: "number", required: true },
          { name: "date", type: "string (ISO 8601)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Transaksi berhasil diperbarui",
            data: {
              idTransaction: "transaction-4",
              type: "expense",
              idWallet: "wallet-1",
              idCategory: "category-1",
              idSubCategory: "subcategory-1",
              idWalletFrom: null,
              idWalletTo: null,
              title: "Ngasih ke adek",
              notes: "",
              amount: 150000,
              date: "2026-07-10T10:00:00.000Z",
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Transaksi tidak ditemukan",
          },
          null,
          2,
        ),
      },
      {
        id: "delete-transaction",
        title: "Delete Transaction",
        method: "DELETE",
        endpoint: "/transactions/:idTransaction",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Transaksi berhasil dihapus",
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Transaksi tidak ditemukan",
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    key: "settings",
    titleKey: "apiDoc.groups.settings",
    endpoints: [
      {
        id: "get-settings",
        title: "Get Settings",
        method: "GET",
        endpoint: "/settings",
        payload: [],
        successExample: JSON.stringify(
          {
            success: true,
            data: {
              currency: "IDR",
              decimalPlaces: 0,
              language: "id",
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Token tidak valid atau sudah kedaluwarsa",
          },
          null,
          2,
        ),
      },
      {
        id: "update-settings",
        title: "Update Settings",
        method: "PATCH",
        endpoint: "/settings",
        payload: [
          { name: "currency", type: '"IDR" | "USD" | "JPY"', required: false },
          { name: "decimalPlaces", type: "0 | 1 | 2", required: false },
          { name: "language", type: '"id" | "en" | "jp"', required: false },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Pengaturan berhasil diperbarui",
            data: {
              currency: "USD",
              decimalPlaces: 2,
              language: "en",
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Mata uang tidak valid",
          },
          null,
          2,
        ),
      },
    ],
  },
];
