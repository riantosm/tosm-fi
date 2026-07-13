export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export type UserRole = "admin" | "user";
export type UserStatus = "pending" | "active";

export interface AuthUser {
  idUser: string;
  nameUser: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  netWorth?: number;
}

export interface IAuthenticationReduxState {
  isLogin: boolean;
  userDetail: Partial<AuthUser>;
  token: string;
  sessionExpired: boolean;
}
