/** Client-side image compress for Xiaohongshu publish payloads. */

export type CompressedImage = {
  id: string;
  filename: string;
  contentType: string;
  data: string; // base64 without data: prefix
  previewUrl: string;
};

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

export async function compressImageFile(file: File): Promise<CompressedImage> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  if (!file.type.startsWith("image/")) {
    throw new Error("not an image");
  }

  // Keep GIF/WebP as-is if small enough; otherwise rasterize to JPEG.
  if ((file.type === "image/gif" || file.type === "image/webp") && file.size <= 1_200_000) {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
    return {
      id,
      filename: file.name || `img-${id}.webp`,
      contentType: file.type,
      data: btoa(binary),
      previewUrl: URL.createObjectURL(file),
    };
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] || "";
  const previewUrl = URL.createObjectURL(file);
  const safeName = (file.name || "photo.jpg").replace(/\.[^.]+$/, "") + ".jpg";
  return {
    id,
    filename: safeName,
    contentType: "image/jpeg",
    data: base64,
    previewUrl,
  };
}
