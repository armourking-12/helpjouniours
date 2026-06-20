import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { uploadToGithub, deleteFromGithub, type GithubStorageMetadata } from "./github";

const FIVE_MB = 5 * 1024 * 1024;

export interface StorageUploadResult {
  url: string;
  provider: "cloudinary" | "github";
  publicId?: string;
}

/**
 * Automatically routes the upload to Cloudinary (<5MB) or GitHub (>5MB).
 */
export async function uploadResource(
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number,
  metadata: GithubStorageMetadata
): Promise<StorageUploadResult> {
  // If file is > 5MB, use GitHub Storage
  if (fileSize > FIVE_MB) {
    const url = await uploadToGithub(fileBuffer, fileName, metadata);
    return { url, provider: "github" };
  }

  // Otherwise, use Cloudinary
  const result = await uploadToCloudinary(fileBuffer, fileName);
  return {
    url: result.url,
    provider: "cloudinary",
    publicId: result.publicId,
  };
}

/**
 * Delete a resource from its respective storage provider
 */
export async function deleteResource(
  urlOrPublicId: string,
  provider: "cloudinary" | "github"
): Promise<void> {
  if (provider === "github") {
    await deleteFromGithub(urlOrPublicId);
  } else {
    await deleteFromCloudinary(urlOrPublicId);
  }
}
