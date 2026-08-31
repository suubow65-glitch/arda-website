import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { getDocuments } from "@/lib/content";

export default async function DocumentsPreview() {
  const documents = await getDocuments();
  const featured = documents
    .filter((doc) => ["Annual Report", "Policy"].includes(doc.type))
    .slice(0, 4);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {featured.map((doc) => (
          <article
            key={doc.id}
            className="flex items-start gap-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-card"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-relief">
                {doc.type} · {doc.year}
              </p>
              <h3 className="mt-1 font-display text-lg text-navy">{doc.title}</h3>
              <p className="mt-1 text-sm text-navy/65">{doc.description}</p>
              <a
                href={doc.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline"
              >
                <Download className="h-4 w-4" />
                Download PDF ({doc.size})
              </a>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/documents" className="btn-navy">
          Browse all documents
        </Link>
      </div>
    </div>
  );
}
