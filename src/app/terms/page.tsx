import { Nav, Footer, BackgroundBlobs } from "@/components/layout";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | FINDit",
  description:
    "Terms and conditions for using FINDit, the campus lost & found platform for ESTIN Bejaia students.",
};

export default function TermsOfService() {
  return (
    <>
      <BackgroundBlobs />
      <Nav minimal />
      <main className="flex-1">
        <article className="relative z-5 max-w-4xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-display font-bold text-white/50 hover:text-yellow transition-colors mb-8"
          >
            ← Back to FINDit
          </Link>

          <p className="text-sm uppercase tracking-widest text-teal font-semibold mb-2">
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-1">
            Terms of <span className="text-yellow">Service</span>
          </h1>
          <p className="text-sm text-white/50 mb-8">Last updated: February 2026</p>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">What FINDit is</h2>
            <p className="text-sm leading-relaxed text-white/70">
              FINDit is a free, student-built lost &amp; found platform for{" "}
              <strong className="text-white">ESTIN Bejaia</strong>. It is not a commercial service. By
              using FINDit, you agree to these terms.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Who can use it</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              FINDit is exclusively for{" "}
              <strong className="text-white">current students of ESTIN Bejaia</strong> with a valid{" "}
              <strong className="text-white">@estin.dz</strong> Google account. Access is automatically
              revoked if your account no longer qualifies.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              You may not create accounts on behalf of others, share your access,
              or attempt to bypass the domain verification.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">What you can post</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              You may only post items that were genuinely lost or found on or
              around the ESTIN campus. Posts must be{" "}
              <strong className="text-white">honest and accurate</strong> — do not post fake listings,
              test entries in production, or items that belong to someone else
              with intent to deceive.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              Posts that are offensive, misleading, or abusive will be removed
              and the account may be banned.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Claiming items</h2>
            <p className="text-sm leading-relaxed text-white/70">
              When you claim a found item, you confirm that it genuinely belongs
              to you.{" "}
              <strong className="text-white">
                False claims are a violation of these terms
              </strong>{" "}
              and may result in account removal. FINDit is not responsible for
              disputes between users — it is a platform to connect people, not a
              mediator.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">No guarantees</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              FINDit is provided <strong className="text-white">as-is</strong>, built and maintained by
              a student in their free time. We do not guarantee uptime, data
              retention, or successful item reunions. Use it at your own
              discretion.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              We are not liable for any loss, damage, or dispute arising from use
              of the platform.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Your content</h2>
            <p className="text-sm leading-relaxed text-white/70 mb-3">
              You own what you post. By posting on FINDit, you grant us
              permission to display it to other verified ESTIN students. We will
              never sell your content or use it outside the platform.
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              You can request deletion of your posts and account at any time by
              contacting{" "}
              <a href="mailto:am_belamri@estin.dz" className="legal-link">
                am_belamri@estin.dz
              </a>
              .
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Changes to these terms</h2>
            <p className="text-sm leading-relaxed text-white/70">
              These terms may be updated occasionally. Continued use of FINDit
              after changes means you accept the new terms. We&apos;ll try to keep
              things simple and fair — this is a campus project, not a
              corporation.
            </p>
          </section>

          <section className="legal-card mb-4">
            <h2 className="legal-heading">Contact</h2>
            <p className="text-sm leading-relaxed text-white/70">
              Questions or concerns? Reach out at{" "}
              <a href="mailto:am_belamri@estin.dz" className="legal-link">
                am_belamri@estin.dz
              </a>{" "}
              or on{" "}
              <a
                href="https://github.com/aynxitis"
                target="_blank"
                rel="noopener noreferrer"
                className="legal-link"
              >
                GitHub
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
