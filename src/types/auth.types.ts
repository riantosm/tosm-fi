export interface LoginCredentials {
  username: string;
  password: string;
  remember: boolean;
}

export interface AuthUser {
  idUser: string;
  nameUser: string;
  username: string;
  netWorth: number;
}

export interface IAuthenticationReduxState {
  isLogin: boolean;
  userDetail: Partial<AuthUser>;
  token: string;
}
