export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface RegisterInput {
  nameUser: string;
  username: string;
  password: string;
}

export interface UpdateProfileInput {
  nameUser: string;
  username: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type UserRole = "admin" | "user";
export type UserStatus = "pending" | "active";

export interface AuthUser {
  idUser: string;
  nameUser: string;
  username: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  netWorth?: number;
}

export interface IAuthenticationReduxState {
  isLogin: boolean;
  userDetail: Partial<AuthUser>;
  token: string;
  sessionExpired: boolean;
}
