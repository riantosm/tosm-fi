export interface ClientError {
  idClientError: string;
  idUser: string | null;
  source: string;
  message: string;
  stack?: string;
  path?: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
  createdAt: string;
}

export interface ClientErrorInput {
  source: string;
  message: string;
  stack?: string;
  path?: string;
  userAgent?: string;
  extra?: Record<string, unknown>;
}
