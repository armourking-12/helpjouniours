import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { uploadToGithub, deleteFromGithub, type GithubStorageMetadata } from "./github";

const TEN_MB = 10 * 1024 * 1024;

export interface StorageUploadResult {
  url: string;
  provider: "cloudinary" | "github";
  publicId?: string;
}

/**
 * Automatically routes the upload to Cloudinary (<10MB) or GitHub (>10MB).
 */
export async function uploadResource(
  fileBuffer: Buffer,
  fileName: string,
  fileSize: number,
  metadata: GithubStorageMetadata
): Promise<StorageUploadResult> {
  // If file is > 10MB, use GitHub Storage
  if (fileSize > TEN_MB) {
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
