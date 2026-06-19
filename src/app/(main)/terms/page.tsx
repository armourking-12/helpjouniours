import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms of Service for ${APP_NAME}. Read our terms and conditions for using the platform.`,
};

export default function TermsPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Terms of Service"
          description="Last updated: June 1, 2026"
        />
      </div>

      <section className="pb-20 pt-4">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <AnimatedContainer variant="fadeUp">
            <div className="prose prose-neutral dark:prose-invert max-w-none rounded-2xl border border-border/50 bg-card p-8 md:p-10">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing and using {APP_NAME}, you agree to be bound by these Terms
                of Service. If you do not agree to these terms, please do not use our
                platform.
              </p>

              <h2>2. User Accounts</h2>
              <p>
                You are responsible for maintaining the security of your account. You must
                provide accurate information during registration. You are responsible for
                all activity under your account.
              </p>

              <h2>3. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Upload copyrighted material without permission</li>
                <li>Share malicious files or content</li>
                <li>Impersonate other users or institutions</li>
                <li>Attempt to circumvent moderation</li>
                <li>Use the platform for commercial purposes without permission</li>
                <li>Upload content that is offensive, misleading, or inappropriate</li>
              </ul>

              <h2>4. Content Ownership</h2>
              <p>
                You retain ownership of content you upload. By uploading, you grant{" "}
                {APP_NAME} a non-exclusive license to store, display, and distribute
                your content through our platform. You confirm that you have the right
                to share any content you upload.
              </p>

              <h2>5. Content Moderation</h2>
              <p>
                All uploads are subject to moderation. We reserve the right to remove any
                content that violates these terms, is inappropriate, or is reported by
                other users. Repeated violations may result in account suspension.
              </p>

              <h2>6. Reputation System</h2>
              <p>
                Reputation points are earned through approved uploads and community
                engagement. We reserve the right to adjust reputation scores in cases of
                abuse or policy violations.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                {APP_NAME} is provided &ldquo;as is&rdquo; without warranties. We are
                not liable for the accuracy of uploaded content. Use academic resources
                at your own discretion.
              </p>

              <h2>8. Termination</h2>
              <p>
                We may terminate or suspend your account at any time for violations of
                these terms. You may delete your account at any time through your account
                settings.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the
                platform after changes constitutes acceptance of the new terms.
              </p>

              <h2>10. Contact</h2>
              <p>
                For questions about these terms, contact us at{" "}
                <a href="mailto:legal@helpjuniors.app">legal@helpjuniors.app</a>.
              </p>
            </div>
          </AnimatedContainer>
        </div>
      </section>
    </>
  );
}
