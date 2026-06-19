import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a file to Cloudinary.
 * Used for images and PDFs under 10MB.
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = "helpjuniors"
): Promise<{ url: string; publicId: string; format: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: fileName,
        resource_type: "auto", // Automatically detect image or raw (PDF)
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Failed to upload to Cloudinary"));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
          });
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Generate an optimized image URL
 */
export function getOptimizedImageUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: "auto",
    crop: "scale",
    width: 800,
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
