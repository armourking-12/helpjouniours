import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import connectToDatabase from "@/lib/db/mongoose";
import { Resource } from "@/lib/db/models/Resource";
import { User } from "@/lib/db/models/User";
import { ResourceDetailsClient } from "./ResourceDetailsClient";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await connectToDatabase();
  const resource = await Resource.findById(id).lean();
  
  if (!resource) {
    return { title: "Resource Not Found" };
  }

  return {
    title: resource.title,
    description: resource.description,
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: resource.title,
      description: resource.description,
    },
    alternates: {
      canonical: `/resources/${id}`,
    }
  };
}

export default async function ResourceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();

  const resource = await Resource.findById(id).lean();
  if (!resource || resource.status !== "approved") {
    notFound();
  }

  // Calculate hasLiked and hasSaved for the current user server-side
  const { userId: clerkId } = await auth();
  let currentUser: any = null;
  let hasLiked = false;
  let hasSaved = false;

  if (clerkId) {
    currentUser = await User.findOne({ clerkId }).lean();
    if (currentUser) {
      hasLiked = Array.isArray(resource.likes) && resource.likes.some((uid: any) => uid.toString() === currentUser._id.toString());
      hasSaved = Array.isArray(currentUser.savedResources) && currentUser.savedResources.some((rid: any) => rid.toString() === resource._id.toString());
    }
  }

  // Strip internal arrays before passing to client
  const { likes, viewedBy, ...safeResource } = resource;

  const initialResource = {
    ...safeResource,
    _id: resource._id.toString(),
    likesCount: Array.isArray(likes) ? likes.length : 0,
    hasLiked,
    hasSaved,
    uploadedBy: {
      ...resource.uploadedBy,
      userId: resource.uploadedBy.userId.toString()
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://helpjuniors.com";

  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": baseUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Resources",
                "item": `${baseUrl}/resources`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": resource.title,
                "item": `${baseUrl}/resources/${id}`
              }
            ]
          })
        }}
      />
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": resource.title,
            "description": resource.description,
            "author": {
              "@type": "Person",
              "name": resource.uploadedBy?.name || "Student"
            },
            "datePublished": resource.createdAt,
            "dateModified": resource.updatedAt || resource.createdAt,
          })
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link 
        href="/resources"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-indigo-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Resources
      </Link>

      <ResourceDetailsClient initialResource={JSON.parse(JSON.stringify(initialResource))} />
    </div>
    </>
  );
}
