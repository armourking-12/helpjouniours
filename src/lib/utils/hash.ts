/**
 * Generates a SHA-256 hash for a given File object using the Web Crypto API.
 * This is performed entirely on the client-side to check for duplicates
 * before uploading large files to Firebase.
 *
 * @param file The file to hash
 * @returns A promise that resolves to the hex string representation of the hash
 */
export async function generateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Hash the file contents
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  
  // Convert ArrayBuffer to Array of bytes
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  // Convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
    
  return hashHex;
}
