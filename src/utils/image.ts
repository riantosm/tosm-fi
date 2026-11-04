import type { WalletLogoImage } from "@/types/wallet.types";

export const IMAGE_UPLOAD_ACCEPT = "image/png,image/jpeg,image/webp";
/** Checked before resizing — the uploaded result is always much smaller. */
export const IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

export interface ResizedImage {
  image: WalletLogoImage;
  /** data: URL of the resized image, for an instant preview before it's uploaded. */
  previewUrl: string;
}

/**
 * Scales an image down to fit `maxSize`×`maxSize` (never up), keeping its aspect
 * ratio and transparency, and re-encodes it as WebP (PNG where the browser
 * can't encode WebP). Logos only need ~256px, so this keeps uploads tiny.
 */
export async function resizeImageFile(file: File, maxSize = 256): Promise<ResizedImage> {
  if (!IMAGE_UPLOAD_ACCEPT.split(",").includes(file.type)) throw new Error("unsupported");
  if (file.size > IMAGE_UPLOAD_MAX_BYTES) throw new Error("tooLarge");

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("unsupported");
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let previewUrl = canvas.toDataURL("image/webp", 0.9);
  // Browsers that can't encode WebP silently fall back to PNG.
  const mimeType: WalletLogoImage["mimeType"] = previewUrl.startsWith("data:image/webp")
    ? "image/webp"
    : "image/png";
  if (mimeType === "image/png") previewUrl = canvas.toDataURL("image/png");

  return { image: { mimeType, data: previewUrl.slice(previewUrl.indexOf(",") + 1) }, previewUrl };
}
