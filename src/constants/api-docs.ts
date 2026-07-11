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
                id: "1",
                name: "John Doe",
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
              id: "1",
              name: "John Doe",
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
                id: "wallet-1",
                name: "Cash",
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
          { name: "name", type: "string", required: true },
          { name: "color", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet berhasil dibuat",
            data: {
              id: "wallet-6",
              name: "Dana Liburan",
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
        endpoint: "/wallets/:id",
        payload: [
          { name: "name", type: "string", required: true },
          { name: "color", type: "string", required: true },
        ],
        successExample: JSON.stringify(
          {
            success: true,
            message: "Wallet berhasil diperbarui",
            data: {
              id: "wallet-6",
              name: "Dana Liburan 2027",
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
];
