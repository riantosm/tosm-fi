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
        id: "register",
        title: "Register",
        method: "POST",
        endpoint: "/auth/register",
        payload: [
          { name: "nameUser", type: "string", required: true },
          { name: "username", type: "string", required: true },
          { name: "password", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            message: "Registrasi berhasil, menunggu validasi admin",
            data: {
              idUser: "2",
              nameUser: "Jane Doe",
              username: "janedoe",
              role: "user",
              status: "pending",
              createdAt: "2026-07-13T08:30:00.000Z",
            },
            isSuccess: true,
            status: 201,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Username sudah terdaftar",
            data: { error: "Username sudah terdaftar" },
            isSuccess: false,
            status: 400,
          },
          null,
          2,
        ),
      },
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
            message: "Login berhasil",
            data: {
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                idUser: "1",
                nameUser: "John Doe",
                username: "johndoe",
                role: "admin",
                status: "active",
                createdAt: "2026-01-05T02:15:00.000Z",
              },
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Username atau password salah",
            data: { error: "Username atau password salah" },
            isSuccess: false,
            status: 401,
          },
          null,
          2,
        ),
      },
      {
        id: "get-user",
        title: "Get User",
        method: "GET",
        endpoint: "/user/me",
        payload: [],
        successExample: JSON.stringify(
          {
            message: "Berhasil mengambil data user",
            data: {
              idUser: "1",
              nameUser: "John Doe",
              username: "johndoe",
              role: "admin",
              status: "active",
              createdAt: "2026-01-05T02:15:00.000Z",
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Menunggu validasi",
            data: {},
            isSuccess: false,
            status: 403,
          },
          null,
          2,
        ),
      },
      {
        id: "get-list-user",
        title: "Get List User",
        method: "GET",
        endpoint: "/user/get-list-user",
        payload: [],
        successExample: JSON.stringify(
          {
            message: "Berhasil mengambil daftar user",
            data: [
              {
                idUser: "1",
                nameUser: "John Doe",
                username: "johndoe",
                role: "admin",
                status: "active",
                createdAt: "2026-01-05T02:15:00.000Z",
              },
              {
                idUser: "2",
                nameUser: "Jane Doe",
                username: "janedoe",
                role: "user",
                status: "pending",
                createdAt: "2026-07-13T08:30:00.000Z",
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Forbidden: admin only",
            data: {},
            isSuccess: false,
            status: 403,
          },
          null,
          2,
        ),
      },
      {
        id: "accept-user",
        title: "Accept User",
        method: "POST",
        endpoint: "/user/accept-user",
        payload: [{ name: "idUser", type: "string", required: true }],
        successExample: JSON.stringify(
          {
            message: "User berhasil divalidasi",
            data: {
              idUser: "2",
              nameUser: "Jane Doe",
              username: "janedoe",
              role: "user",
              status: "active",
              createdAt: "2026-07-13T08:30:00.000Z",
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "User tidak ditemukan",
            data: { error: "User tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Logout berhasil",
            data: {},
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Invalid or expired token",
            data: {},
            isSuccess: false,
            status: 401,
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
            message: "Berhasil mengambil daftar wallet",
            data: [
              {
                idWallet: "6a54775fb2c4f567c96e74f4",
                nameWallet: "Cash",
                color: "#a16207",
                balance: 850000,
                transactionCount: 42,
                isPrimary: true,
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Unauthorized",
            data: {},
            isSuccess: false,
            status: 401,
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
            message: "Wallet berhasil dibuat",
            data: {
              idWallet: "6a54775fb2c4f567c96e74f6",
              nameWallet: "Dana Liburan",
              color: "#075985",
              balance: 0,
              transactionCount: 0,
              isPrimary: false,
            },
            isSuccess: true,
            status: 201,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "nameWallet dan color wajib diisi",
            data: { error: "nameWallet dan color wajib diisi" },
            isSuccess: false,
            status: 400,
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
            message: "Wallet berhasil diperbarui",
            data: {
              idWallet: "6a54775fb2c4f567c96e74f6",
              nameWallet: "Dana Liburan 2027",
              color: "#3f6212",
              balance: 0,
              transactionCount: 0,
              isPrimary: false,
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Wallet tidak ditemukan",
            data: { error: "Wallet tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Wallet berhasil dihapus",
            data: {},
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Wallet tidak ditemukan",
            data: { error: "Wallet tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Wallet utama berhasil diubah",
            data: [
              {
                idWallet: "6a54775fb2c4f567c96e74f4",
                nameWallet: "Cash",
                color: "#a16207",
                balance: 850000,
                transactionCount: 42,
                isPrimary: false,
              },
              {
                idWallet: "6a54775fb2c4f567c96e74f6",
                nameWallet: "Dana Liburan",
                color: "#075985",
                balance: 0,
                transactionCount: 0,
                isPrimary: true,
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Wallet tidak ditemukan",
            data: { error: "Wallet tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Urutan wallet berhasil disimpan",
            data: [
              {
                idWallet: "6a54775fb2c4f567c96e74f6",
                nameWallet: "Dana Liburan",
                color: "#075985",
                balance: 0,
                transactionCount: 0,
                isPrimary: true,
              },
              {
                idWallet: "6a54775fb2c4f567c96e74f4",
                nameWallet: "Cash",
                color: "#a16207",
                balance: 850000,
                transactionCount: 42,
                isPrimary: false,
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "orderedIds wajib diisi",
            data: { error: "orderedIds wajib diisi" },
            isSuccess: false,
            status: 400,
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
            message: "Berhasil mengambil daftar kategori",
            data: [
              {
                idCategory: "6a54caaa84245dacc470c8c1",
                nameCategory: "Makan",
                type: "expense",
                color: "#E2574C",
                icon: "HiOutlineCake",
                transactionCount: 12,
                subCategories: [
                  {
                    idSubCategory: "6a54cab784245dacc470c8ca",
                    idCategory: "6a54caaa84245dacc470c8c1",
                    nameSubCategory: "Warteg",
                    icon: "HiOutlineBuildingStorefront",
                    transactionCount: 5,
                  },
                ],
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Unauthorized",
            data: {},
            isSuccess: false,
            status: 401,
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
            message: "Kategori berhasil dibuat",
            data: {
              idCategory: "6a54cab784245dacc470c8c6",
              nameCategory: "Gaji",
              type: "income",
              color: "#7CB87C",
              icon: "HiOutlineBriefcase",
              transactionCount: 0,
              subCategories: [],
            },
            isSuccess: true,
            status: 201,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "nameCategory, type, color, dan icon wajib diisi",
            data: { error: "nameCategory, type, color, dan icon wajib diisi" },
            isSuccess: false,
            status: 400,
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
            message: "Kategori berhasil diperbarui",
            data: {
              idCategory: "6a54cab784245dacc470c8c6",
              nameCategory: "Gaji Bulanan",
              type: "income",
              color: "#075985",
              icon: "HiOutlineBanknotes",
              transactionCount: 0,
              subCategories: [],
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Kategori tidak ditemukan",
            data: { error: "Kategori tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Kategori berhasil dihapus",
            data: {},
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Kategori tidak ditemukan",
            data: { error: "Kategori tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Urutan kategori berhasil disimpan",
            data: [
              {
                idCategory: "6a54cab784245dacc470c8c6",
                nameCategory: "Gaji",
                type: "income",
                color: "#7CB87C",
                icon: "HiOutlineBriefcase",
                transactionCount: 0,
                subCategories: [],
              },
              {
                idCategory: "6a54caaa84245dacc470c8c1",
                nameCategory: "Makan",
                type: "expense",
                color: "#E2574C",
                icon: "HiOutlineCake",
                transactionCount: 12,
                subCategories: [],
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "orderedIds wajib diisi",
            data: { error: "orderedIds wajib diisi" },
            isSuccess: false,
            status: 400,
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
            message: "Subkategori berhasil dibuat",
            data: {
              idSubCategory: "6a54cab784245dacc470c8cf",
              idCategory: "6a54caaa84245dacc470c8c1",
              nameSubCategory: "Restoran",
              icon: "HiOutlineBuildingStorefront",
              transactionCount: 0,
            },
            isSuccess: true,
            status: 201,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "nameSubCategory dan icon wajib diisi",
            data: { error: "nameSubCategory dan icon wajib diisi" },
            isSuccess: false,
            status: 400,
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
            message: "Subkategori berhasil diperbarui",
            data: {
              idSubCategory: "6a54cab784245dacc470c8cf",
              idCategory: "6a54caaa84245dacc470c8c1",
              nameSubCategory: "Restoran Padang",
              icon: "HiOutlineBuildingStorefront",
              transactionCount: 0,
            },
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Subkategori tidak ditemukan",
            data: { error: "Subkategori tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Subkategori berhasil dihapus",
            data: {},
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Subkategori tidak ditemukan",
            data: { error: "Subkategori tidak ditemukan" },
            isSuccess: false,
            status: 400,
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
            message: "Urutan subkategori berhasil disimpan",
            data: [
              {
                idSubCategory: "6a54cab784245dacc470c8cf",
                idCategory: "6a54caaa84245dacc470c8c1",
                nameSubCategory: "Kopi",
                icon: "HiOutlineCake",
                transactionCount: 0,
              },
              {
                idSubCategory: "6a54cab784245dacc470c8ca",
                idCategory: "6a54caaa84245dacc470c8c1",
                nameSubCategory: "Warteg",
                icon: "HiOutlineBuildingStorefront",
                transactionCount: 5,
              },
            ],
            isSuccess: true,
            status: 200,
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "orderedIds wajib diisi",
            data: { error: "orderedIds wajib diisi" },
            isSuccess: false,
            status: 400,
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
        endpoint: "/transactions?month=2026-07&idWallet=wallet-1&idCategory=category-1&idSubCategory=subcategory-1&dateFrom=2026-07-01&dateTo=2026-07-15&search=makan&sort=dateDesc&page=1&limit=20",
        payload: [
          { name: "month", type: "string (YYYY-MM)", required: false },
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
          { name: "page", type: "number (omit with limit for the full unpaginated result)", required: false },
          { name: "limit", type: "number", required: false },
        ],
        successExample: JSON.stringify(
          {
            message: "Berhasil mengambil daftar transaksi",
            isSuccess: true,
            status: 200,
            data: {
              transactions: [
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
              total: 3,
              page: 1,
              limit: 20,
              totalPages: 1,
              summary: {
                income: 0,
                expense: 20000,
                net: -20000,
                categoryBreakdown: [
                  {
                    idCategory: "category-1",
                    nameCategory: "Makan",
                    color: "#E2574C",
                    icon: "IoFastFoodOutline",
                    amount: 17000,
                    transactionCount: 1,
                    percentage: 85,
                    subCategoryBreakdown: [
                      {
                        idSubCategory: "subcategory-1",
                        nameSubCategory: "Warteg",
                        icon: "MdOutlineRestaurant",
                        amount: 17000,
                        transactionCount: 1,
                        percentage: 100,
                      },
                    ],
                  },
                ],
              },
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Token sudah tidak berlaku, silakan login kembali",
            isSuccess: false,
            status: 401,
            data: { error: "Token sudah tidak berlaku, silakan login kembali" },
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
          { name: "title", type: "string", required: true },
          { name: "notes", type: "string", required: false },
          { name: "amount", type: "number", required: true },
          { name: "date", type: "string (ISO 8601)", required: true },
        ],
        successExample: JSON.stringify(
          {
            message: "Transaksi berhasil dibuat",
            isSuccess: true,
            status: 201,
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
            message: "Kategori tidak ditemukan",
            isSuccess: false,
            status: 400,
            data: { error: "Kategori tidak ditemukan" },
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
          { name: "title", type: "string", required: true },
          { name: "notes", type: "string", required: false },
          { name: "amount", type: "number", required: true },
          { name: "date", type: "string (ISO 8601)", required: true },
        ],
        successExample: JSON.stringify(
          {
            message: "Transaksi berhasil diperbarui",
            isSuccess: true,
            status: 200,
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
            message: "Transaksi tidak ditemukan",
            isSuccess: false,
            status: 400,
            data: { error: "Transaksi tidak ditemukan" },
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
            message: "Transaksi berhasil dihapus",
            isSuccess: true,
            status: 200,
            data: {},
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            message: "Transaksi tidak ditemukan",
            isSuccess: false,
            status: 400,
            data: { error: "Transaksi tidak ditemukan" },
          },
          null,
          2,
        ),
      },
    ],
  },
  {
    key: "report",
    titleKey: "apiDoc.groups.report",
    endpoints: [
      {
        id: "report-summary",
        title: "Report Summary",
        method: "GET",
        endpoint: "/reports/summary?dateFrom=2026-07-01&dateTo=2026-07-31",
        payload: [
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: {
              totalIncome: { value: 12_450_000, changePercent: 18 },
              totalExpense: { value: 7_850_000, changePercent: -8 },
              netCashFlow: { value: 4_600_000, changePercent: 32 },
              transactionCount: { value: 84, changePercent: 16 },
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
        id: "report-cash-flow",
        title: "Cash Flow",
        method: "GET",
        endpoint: "/reports/cash-flow?dateFrom=2026-01-01&dateTo=2026-07-31",
        payload: [
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              { label: "Jan", income: 8_000_000, expense: 5_200_000 },
              { label: "Feb", income: 8_000_000, expense: 6_100_000 },
              { label: "Jul", income: 12_450_000, expense: 7_850_000 },
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
        id: "report-category-breakdown",
        title: "Category Breakdown",
        method: "GET",
        endpoint: "/reports/category-breakdown?dateFrom=2026-07-01&dateTo=2026-07-31",
        payload: [
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                idCategory: "category-1",
                nameCategory: "Makanan",
                color: "#E2574C",
                icon: "HiOutlineCake",
                total: 2_986_000,
                percentage: 38,
                transactionCount: 24,
                subCategories: [
                  { idSubCategory: "subcategory-1", nameSubCategory: "Warteg", total: 820_000, percentage: 27 },
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
        id: "report-monthly-trend",
        title: "Monthly Trend",
        method: "GET",
        endpoint: "/reports/monthly-trend?metric=expense&months=12",
        payload: [
          { name: "metric", type: '"expense" | "income"', required: true },
          { name: "months", type: "number", required: false },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              { label: "Agu", value: 6_400_000 },
              { label: "Sep", value: 5_900_000 },
              { label: "Jul", value: 7_850_000 },
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
        id: "report-wallet-usage",
        title: "Wallet Usage",
        method: "GET",
        endpoint: "/reports/wallet-usage?dateFrom=2026-07-01&dateTo=2026-07-31",
        payload: [
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              { idWallet: "wallet-1", nameWallet: "Jago", color: "#7CB87C", transactionCount: 40, percentage: 48 },
              { idWallet: "wallet-2", nameWallet: "Cash", color: "#4C6FFF", transactionCount: 18, percentage: 22 },
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
        id: "report-top-spending",
        title: "Top Spending",
        method: "GET",
        endpoint: "/reports/top-spending?dateFrom=2026-07-01&dateTo=2026-07-31&limit=10",
        payload: [
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
          { name: "limit", type: "number", required: false },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            data: [
              {
                idTransaction: "transaction-1",
                rank: 1,
                title: "Warteg",
                categoryName: "Makanan",
                subCategoryName: "Warteg",
                amount: 850_000,
                date: "2026-07-12T09:00:00.000Z",
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
        id: "export-report",
        title: "Export Report",
        method: "POST",
        endpoint: "/reports/export",
        payload: [
          { name: "format", type: '"pdf" | "excel" | "csv"', required: true },
          { name: "dateFrom", type: "string (YYYY-MM-DD)", required: true },
          { name: "dateTo", type: "string (YYYY-MM-DD)", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Laporan berhasil diekspor",
            data: {
              fileName: "laporan_2026-07-01_2026-07-31.pdf",
            },
          },
          null,
          2,
        ),
        errorExample: JSON.stringify(
          {
            success: false,
            message: "Format export tidak valid",
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
