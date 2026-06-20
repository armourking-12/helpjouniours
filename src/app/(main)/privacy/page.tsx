import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Privacy Policy for ${APP_NAME}. Learn how we collect, use, and protect your personal information.`,
};

export default function PrivacyPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Privacy Policy"
          description="Last updated: June 1, 2026"
        />
      </div>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp">
            <div className="prose prose-neutral dark:prose-invert max-w-none rounded-2xl border border-border/50 bg-card p-8 md:p-10">
              <h2>1. Information We Collect</h2>
              <p>
                When you create an account on {APP_NAME}, we collect your name, email
                address, and optional profile information such as your university, course,
                and semester. When you upload resources, we store the file metadata and
                content.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul>
                <li>Provide and improve our platform services</li>
                <li>Process and moderate uploaded resources</li>
                <li>Calculate and display your reputation score</li>
                <li>Send notifications about your uploads and account</li>
                <li>Prevent abuse and maintain platform security</li>
              </ul>

              <h2>3. AI Processing</h2>
              <p>
                When you use our AI-powered upload feature, your uploaded images are
                processed by Google&apos;s Gemini AI to extract academic metadata. This
                processing is done in real-time and we do not store the AI analysis
                results separately from your upload.
              </p>

              <h2>4. Data Storage</h2>
              <p>
                Your data is stored securely using Firebase services (Authentication,
                Firestore, and Cloud Storage) provided by Google Cloud Platform. All data
                is encrypted in transit and at rest.
              </p>

              <h2>5. Data Sharing</h2>
              <p>
                We do not sell your personal information. Your uploaded resources are
                shared publicly (after moderation) as intended by the platform. Your
                profile information (name and university) is visible on resources you
                upload and on the leaderboard.
              </p>

              <h2>6. Cookies</h2>
              <p>
                We use essential cookies for authentication and theme preferences. We do
                not use tracking or advertising cookies.
              </p>

              <h2>7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Request deletion of specific uploaded resources</li>
              </ul>

              <h2>8. Contact</h2>
              <p>
                For privacy-related inquiries, contact us at{" "}
                <a href="mailto:vm9678974@gmail.com">vm9678974@gmail.com</a>.
              </p>
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
