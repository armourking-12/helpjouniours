import type { Metadata } from "next";
import { ResourcesClient } from "./ResourcesClient";

export const metadata: Metadata = {
  title: "Resources | HelpJuniors",
  description:
    "Browse and download previous year question papers, notes, assignments, lab files, and study materials from universities across India.",
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
