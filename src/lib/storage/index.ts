import { uploadToCloudinary, deleteFromCloudinary } from "./cloudinary";
import { uploadToGithub, deleteFromGithub, type GithubStorageMetadata } from "./github";

const FIVE_MB = 5 * 1024 * 1024;

export interface StorageUploadResult {
  url: string;
  provider: "cloudinary" | "github";
  publicId?: string;
}

/**
 * Automatically routes the upload to Cloudinary (images) or GitHub (documents like PDFs).
 */
export async function uploadResource(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  metadata: GithubStorageMetadata
): Promise<StorageUploadResult> {
  // If file is an image, use Cloudinary
  if (mimeType.startsWith("image/")) {
    const result = await uploadToCloudinary(fileBuffer, fileName);
    return {
      url: result.url,
      provider: "cloudinary",
      publicId: result.publicId,
    };
  }

  // Otherwise (PDF, DOCX, PPTX), use GitHub Storage
  const url = await uploadToGithub(fileBuffer, fileName, metadata);
  return { url, provider: "github" };
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
