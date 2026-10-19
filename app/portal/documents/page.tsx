import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import Link from "next/link";

const DOC_LABELS: Record<DocumentType, string> = {
  E_NUM: "E Num", DRIVING_LICENCE: "Navteck Report", MEDICAL_REPORT: "Medical Report",
  VISA_COPY: "Visa Copy", PROTECTOR: "Protector", TICKET: "Ticket",
  E_STAMP: "E Stamp", NEVTECK: "NevTeck",
};
const ALL_TYPES = Object.values(DocumentType);

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: { id: true, documents: true },
  });
  if (!client) redirect("/login");

  const uploaded = client.documents.length;
  const pct = Math.round((uploaded / ALL_TYPES.length) * 100);

  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div className="fade-in" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>Documents</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            {uploaded} of {ALL_TYPES.length} files uploaded
          </p>
        </div>
        {/* Upload stat */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.04em" }}>{pct}%</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>complete</div>
          </div>
          {/* Mini ring */}
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle cx="20" cy="20" r="16" fill="none" stroke="var(--gold)" strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * (1 - pct / 100)}`}
              strokeLinecap="butt"
              transform="rotate(-90 20 20)"
              style={{ transition: "stroke-dashoffset 0.6s" }}
            />
          </svg>
        </div>
      </div>

      {/* ── Document list ── */}
      <div className="fade-in-1" style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)" }}>
        {ALL_TYPES.map((type, i) => {
          const doc = client.documents.find(d => d.type === type);
          return (
            <div key={type} style={{
              display: "flex", alignItems: "center", gap: 16,
              padding: "14px 20px",
              background: "var(--bg-surface)",
              animation: `fadeUp 0.3s ${i * 0.04}s cubic-bezier(0.16,1,0.3,1) both`,
            }}>
              {/* Status indicator */}
              <div style={{
                width: 36, height: 36, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: doc ? "var(--success-dim)" : "var(--bg-page)",
                border: `1px solid ${doc ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
              }}>
                {doc ? (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{DOC_LABELS[type]}</div>
                <div style={{ fontSize: 12, color: doc ? "var(--success)" : "var(--text-muted)", marginTop: 3 }}>
                  {doc ? `Uploaded · ${fmtDate(doc.uploadedAt)}` : "Not uploaded yet"}
                </div>
              </div>

              {/* Actions */}
              {doc ? (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link href={`/portal/documents/${type}`} style={{
                    padding: "9px 18px", fontSize: 13, fontWeight: 700,
                    background: "var(--gold)", color: "var(--accent-fg)",
                    textDecoration: "none", display: "inline-block", letterSpacing: "-0.01em",
                  }}>
                    View
                  </Link>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" download={doc.filename} style={{
                    padding: "9px 14px", fontSize: 13, fontWeight: 500,
                    border: "1px solid var(--border)", color: "var(--text-primary)",
                    textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Save
                  </a>
                </div>
              ) : (
                <div style={{
                  padding: "8px 14px", fontSize: 12, fontWeight: 500,
                  border: "1px solid var(--border)", color: "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  Pending
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
