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
];
