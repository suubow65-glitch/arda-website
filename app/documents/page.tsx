"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import PageHero from "@/components/PageHero";
import { getDocuments } from "@/lib/content";
import type { DocumentItem } from "@/data/mockData";

const typeStyle: Record<string, string> = {
  "Annual Report": "bg-relief-100 text-relief-700",
  Policy: "bg-navy/10 text-navy",
  Audit: "bg-action/10 text-action",
  Tender: "bg-surface text-navy",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  useEffect(() => {
    getDocuments().then(setDocuments);
  }, []);

  return (
    <>
      <PageHero
        kicker="Accountability"
        title="Documents & Reports"
        description="Official ARDA publications, policies and reports for partners, donors and the public."
        pageKey="documents"
        sectionKey="hero"
      />
      <section className="py-16">
        <div className="container-arda">
          <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card">
            <div className="hidden grid-cols-12 bg-navy px-6 py-3 text-xs font-semibold uppercase tracking-wide text-white md:grid">
              <span className="col-span-5">Document</span>
              <span className="col-span-2">Category</span>
              <span className="col-span-2">Year</span>
              <span className="col-span-1">Size</span>
              <span className="col-span-2 text-right">Download</span>
            </div>
            <ul>
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  className="grid gap-3 border-b border-navy/10 px-6 py-5 last:border-0 md:grid-cols-12 md:items-center"
              >
                <div className="md:col-span-5">
                  <div className="flex gap-3">
                    <FileText className="mt-0.5 h-5 w-5 shrink-0 text-relief" />
                    <div>
                      <p className="font-semibold text-navy">{doc.title}</p>
                      <p className="mt-1 text-sm text-navy/60">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm md:col-span-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      typeStyle[doc.type] ?? "bg-surface text-navy"
                    }`}
                  >
                    {doc.type}
                  </span>
                </p>
                <p className="text-sm md:col-span-2">{doc.year}</p>
                <p className="text-sm text-navy/60 md:col-span-1">{doc.size}</p>
                <div className="md:col-span-2 md:text-right">
                  <a
                    href={doc.href}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-action hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </a>
                </div>
              </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
