import { ProtectedRoute } from "@/components/auth/protected-route";
import { UploadSystem } from "@/components/upload/upload-system";

export const metadata = {
  title: "Upload Resource",
  description: "Upload study materials, notes, and previous year question papers.",
};

export default function UploadPage() {
  return (
    <ProtectedRoute requireVerified={true}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Upload Resource</h1>
          <p className="mt-2 text-muted-foreground">
            Share your knowledge with juniors. Use our AI scanner for quick uploads!
          </p>
        </div>
        
        <UploadSystem />
      </div>
    </ProtectedRoute>
  );
}
