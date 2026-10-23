"use client";
import { supabase } from "./supabase";

const MAX_BYTES = 2 * 1024 * 1024;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export function avatarUrl(path?: string | null): string | null {
  if (!path) return null;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

/** Uploads into the user's own folder and returns the stored path. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = EXT[file.type];
  if (!ext) throw new Error("Please choose a JPG, PNG or WEBP image.");
  if (file.size > MAX_BYTES) throw new Error("Image must be under 2 MB.");
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
  });
  if (error) throw new Error("Couldn't upload that image, please try again.");
  return path;
}

export async function removeAvatar(path?: string | null) {
  if (!path) return;
  try {
    await supabase.storage.from("avatars").remove([path]);
  } catch {
    /* a leftover file is harmless */
  }
}
