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
];
