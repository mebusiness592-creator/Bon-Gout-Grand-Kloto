import { v2 as cloudinary } from "cloudinary";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}
export function signUpload(kind: "image" | "video", folderName = "bon-gout-grand-kloto") {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = folderName;
  const allowed_formats = kind === "video" ? "mp4,webm,mov" : "jpg,jpeg,png,webp";
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder, allowed_formats }, process.env.CLOUDINARY_API_SECRET as string);
  return { cloudName: process.env.CLOUDINARY_CLOUD_NAME as string, apiKey: process.env.CLOUDINARY_API_KEY as string, timestamp, folder, allowed_formats, signature };
}
