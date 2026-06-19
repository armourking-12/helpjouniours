import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
  type UploadTask,
  type UploadMetadata,
} from "firebase/storage";
import { firebaseApp } from "./config";

/** Firebase Storage instance (singleton) */
export const storage: FirebaseStorage = getStorage(firebaseApp);

// ---------------------------------------------------------------------------
// Upload Helpers
// ---------------------------------------------------------------------------

/** Upload progress callback type */
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: "running" | "paused" | "success" | "canceled" | "error";
}

/**
 * Upload a file to Firebase Storage with progress tracking.
 * @param path - The storage path (e.g., "resources/user123/file.pdf").
 * @param file - The File or Blob to upload.
 * @param metadata - Optional upload metadata (contentType, etc.).
 * @param onProgress - Optional progress callback.
 * @returns The download URL of the uploaded file.
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  metadata?: UploadMetadata,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const storageRef = ref(storage, path);

  const uploadMetadata: UploadMetadata = {
    ...metadata,
    contentType: metadata?.contentType || (file instanceof File ? file.type : undefined),
  };

  const uploadTask: UploadTask = uploadBytesResumable(
    storageRef,
    file,
    uploadMetadata
  );

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          progress: Math.round(progress),
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Get the download URL for a file at the given storage path.
 */
export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage.
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  return deleteObject(storageRef);
}

// ---------------------------------------------------------------------------
// Path Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a unique storage path for a resource upload.
 * Format: resources/{userId}/{timestamp}_{filename}
 */
export function generateResourcePath(
  userId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `resources/${userId}/${timestamp}_${sanitizedName}`;
}

/**
 * Generate a storage path for a user's profile photo.
 * Format: avatars/{userId}/profile.{ext}
 */
export function generateAvatarPath(userId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  return `avatars/${userId}/profile.${ext}`;
}
