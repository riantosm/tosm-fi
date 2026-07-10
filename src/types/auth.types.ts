export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
}

export interface IAuthenticationReduxState {
  isLogin: boolean;
  userDetail: Partial<AuthUser>;
  token: string;
}
