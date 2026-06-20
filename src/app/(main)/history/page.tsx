import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageHeader } from "@/components/shared/page-header";
import { HistoryClient } from "./HistoryClient";

export const metadata = {
  title: "Viewing History",
  description: "View the study materials you have recently accessed.",
};

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Viewing History"
          description="A record of the resources and study materials you have recently viewed."
        />
        <HistoryClient />
      </div>
    </ProtectedRoute>
  );
}
