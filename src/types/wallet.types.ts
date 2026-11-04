export interface WalletAccount {
  idWallet: string;
  nameWallet: string;
  color: string;
  balance: number;
  transactionCount: number;
  isPrimary: boolean;
  /** Uploaded logo (Cloudinary). Absent/null → the default wallet icon. */
  logoUrl?: string | null;
}

export interface WalletInput {
  nameWallet: string;
  color: string;
  balance?: number;
}

/** A resized image ready to send as base64 (see utils/image.ts). */
export interface WalletLogoImage {
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  /** Base64 without the "data:...;base64," prefix. */
  data: string;
}

/** What the form asks for on save: a new logo, removing the current one, or (undefined) no change. */
export type WalletLogoChange = { type: "upload"; image: WalletLogoImage } | { type: "remove" };
