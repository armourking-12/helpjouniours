import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_STORAGE_TOKEN,
});

const owner = process.env.GITHUB_STORAGE_OWNER!;
const repo = process.env.GITHUB_STORAGE_REPO!;

export interface GithubStorageMetadata {
  university: string;
  course: string;
  semester: number;
  subject: string;
  year: number;
  examType: string;
}

/**
 * Upload a large file (>10MB) to GitHub Repository.
 * Returns the raw download URL.
 */
export async function uploadToGithub(
  fileBuffer: Buffer,
  fileName: string,
  metadata: GithubStorageMetadata
): Promise<string> {
  const { university, course, semester, subject, year, examType } = metadata;
  
  // Clean paths to be URL and filesystem safe
  const clean = (str: string) => str.replace(/[^a-zA-Z0-9-]/g, "_");
  
  // Format: University/Course/Semester/Subject/Year/ExamType/filename
  const path = `${clean(university)}/${clean(course)}/Sem_${semester}/${clean(subject)}/${year}/${clean(examType)}/${clean(fileName)}`;

  const contentEncoded = fileBuffer.toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `Upload resource: ${fileName}`,
    content: contentEncoded,
    branch: "main",
  });

  // Return the raw download URL
  return `https://raw.githubusercontent.com/${owner}/${repo}/main/${path}`;
}

/**
 * Delete a file from GitHub Storage
 */
export async function deleteFromGithub(pathUrl: string): Promise<void> {
  // Extract path from the raw github url
  // https://raw.githubusercontent.com/owner/repo/main/path/to/file.pdf
  const urlParts = pathUrl.split("/main/");
  if (urlParts.length !== 2) return;
  const path = urlParts[1];

  try {
    // Get the file sha to delete it
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
    });

    if (!Array.isArray(data) && data.sha) {
      await octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message: `Delete resource: ${path}`,
        sha: data.sha,
        branch: "main",
      });
    }
  } catch (error) {
    console.error("Failed to delete from GitHub:", error);
  }
}
