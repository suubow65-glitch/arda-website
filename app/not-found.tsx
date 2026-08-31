import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-arda py-24 text-center">
      <p className="section-kicker">404</p>
      <h1 className="mt-2 font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-navy/70">
        The page you requested is not available on arda.org.so.
      </p>
      <Link href="/" className="btn-action mt-8">
        Return home
      </Link>
    </section>
  );
}
