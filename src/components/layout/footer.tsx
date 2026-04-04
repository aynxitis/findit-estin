import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <p>
        Made with ♥ by a student, for students · FINDit Campus Lost &amp; Found
        ·{" "}
        <Link href="/privacy" className="footer-link">
          Privacy Policy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="footer-link">
          Terms of Service
        </Link>
      </p>
      <p className="mt-1">© 2026 Anis Belamri · All rights reserved</p>
    </footer>
  );
}
