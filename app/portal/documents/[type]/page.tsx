import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import Link from "next/link";

const DOC_LABELS: Record<DocumentType, string> = {
  E_NUM: "E Num", DRIVING_LICENCE: "Navteck Report", MEDICAL_REPORT: "Medical Report",
  VISA_COPY: "Visa Copy", PROTECTOR: "Protector", TICKET: "Ticket",
  E_STAMP: "E Stamp", NEVTECK: "NevTeck",
};

export default async function DocumentViewPage({ params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { type } = await params;
  if (!Object.values(DocumentType).includes(type as DocumentType)) notFound();
  const docType = type as DocumentType;

  const doc = await prisma.document.findUnique({
    where: { clientId_type: { clientId: session.user.id, type: docType } },
  });
  if (!doc) notFound();

  const isImage = doc.mimeType.startsWith("image/");
  const isPDF = doc.mimeType === "application/pdf";

  return (
    <div className="space-y-6 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/portal/documents" className="transition-colors" style={{ color: "var(--gold-500)" }}>
          Documents
        </Link>
        <span>/</span>
        <span style={{ color: "var(--text-primary)" }}>{DOC_LABELS[docType]}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "var(--gold-400)" }}>{DOC_LABELS[docType]}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            {" · "}{doc.filename}
          </p>
        </div>
        <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.filename}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold"
          style={{ background: "var(--gold-500)", color: "var(--accent-fg)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      </div>

      {/* Preview */}
      <div style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>
        {isImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.url} alt={DOC_LABELS[docType]} className="w-full object-contain" style={{ maxHeight: "75vh" }} />
        )}
        {isPDF && (
          <iframe src={doc.url} className="w-full" style={{ height: "75vh", border: "none" }} title={DOC_LABELS[docType]} />
        )}
        {!isImage && !isPDF && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}
              style={{ color: "var(--text-muted)" }}>
              <path strokeLinecap="square" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ color: "var(--text-muted)" }}>{doc.filename}</p>
            <a href={doc.url} target="_blank" rel="noopener noreferrer"
              className="px-6 py-3 text-sm font-bold"
              style={{ background: "var(--gold-500)", color: "var(--accent-fg)" }}>
              Open File
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
