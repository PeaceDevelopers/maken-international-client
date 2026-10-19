import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { DocumentType } from "@prisma/client";

const DOC_LABELS: Record<DocumentType, string> = {
  E_NUM: "E Num", DRIVING_LICENCE: "Navteck Report", MEDICAL_REPORT: "Medical Report",
  VISA_COPY: "Visa Copy", PROTECTOR: "Protector", TICKET: "Ticket",
  E_STAMP: "E Stamp", NEVTECK: "NevTeck",
};
const ALL_TYPES = Object.values(DocumentType);

const STEP_LABELS = [
  "Account Created", "E Number", "Passport", "Medical Report",
  "Navteck Report", "Visa Copy", "Ticket Issued",
];

export default async function PortalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    include: {
      documents: true,
      deal: { include: { payments: { orderBy: { date: "desc" } } } },
      visaProgress: true,
    },
  });
  if (!client) redirect("/login");

  const { password: _, ...safe } = client;
  const totalPaid = safe.deal?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalDeal = safe.deal?.totalAmount ?? 0;
  const remaining = totalDeal - totalPaid;
  const payPct = totalDeal > 0 ? Math.min(100, (totalPaid / totalDeal) * 100) : 0;
  const lastPayment = safe.deal?.payments[0];

  const vp = safe.visaProgress;
  const steps = STEP_LABELS.map((label, i) => {
    const doneKey = `step${i + 1}Done` as keyof typeof vp;
    const atKey = `step${i + 1}At` as keyof typeof vp;
    return {
      label,
      done: vp ? !!(vp[doneKey]) : false,
      at: vp ? (vp[atKey] as Date | null) : null,
    };
  });
  const doneCount = steps.filter(s => s.done).length;

  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (d: Date | string | null) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div className="fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 48, height: 48, flexShrink: 0,
            background: "var(--gold-glow)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 800, color: "var(--gold)", overflow: "hidden",
          }}>
            {safe.image
              ? <Image src={safe.image} alt={safe.name} width={48} height={48} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              : safe.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.2 }}>
              Welcome back, <span style={{ color: "var(--gold)" }}>{safe.name.split(" ")[0]}</span>
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              Member since {fmtDate(safe.createdAt)} · {safe.documents.length} of {ALL_TYPES.length} documents uploaded
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="fade-in-1 grid grid-cols-2 lg:grid-cols-4" style={{ gap: 1, background: "var(--border)" }}>
        {[
          { label: "Total Deal",  value: fmt(totalDeal),  note: "Agreement amount",     color: "var(--text-primary)" },
          { label: "Amount Paid", value: fmt(totalPaid),  note: "Payments received",    color: "var(--success)" },
          { label: "Balance Due", value: remaining > 0 ? fmt(remaining) : "Settled",     note: remaining > 0 ? "Outstanding balance" : "Fully settled", color: remaining > 0 ? "var(--danger)" : "var(--success)" },
          { label: "Documents",  value: `${safe.documents.length}/${ALL_TYPES.length}`,  note: "Files uploaded",      color: "var(--gold)" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-surface)", padding: "20px 24px" }}>
            <div className="label-caps" style={{ marginBottom: 10 }}>{s.label}</div>
            <div className="stat-num mono" style={{ color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 7 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* ── Visa Progress Timeline ── */}
      <div className="fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Visa Process</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{doneCount} of {steps.length} steps completed</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>{Math.round((doneCount / steps.length) * 100)}%</div>
            <div style={{ width: 80, height: 3, background: "var(--border)" }}>
              <div style={{ height: 3, width: `${(doneCount / steps.length) * 100}%`, background: "var(--gold)", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
          </div>
        </div>

        {/* Horizontal timeline */}
        <div style={{ padding: "24px 24px 28px", overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", minWidth: 560, position: "relative" }}>
            {/* Connector line */}
            <div style={{
              position: "absolute",
              top: 16, left: 16, right: 16,
              height: 1,
              background: "var(--border)",
              zIndex: 0,
            }} />
            {/* Gold fill */}
            <div style={{
              position: "absolute",
              top: 16, left: 16,
              height: 1,
              width: doneCount > 0 ? `calc(${((doneCount - 1) / (steps.length - 1)) * 100}% - 0px)` : 0,
              background: "var(--gold)",
              zIndex: 1,
              transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            }} />

            {steps.map((step, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, position: "relative", zIndex: 2 }}>
                {/* Circle */}
                <div style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: step.done ? "var(--gold)" : "var(--bg-page)",
                  border: `1px solid ${step.done ? "var(--gold)" : "var(--border)"}`,
                  fontSize: 11, fontWeight: 700,
                  color: step.done ? "var(--accent-fg)" : "var(--text-muted)",
                  transition: "all 0.3s",
                }}>
                  {step.done
                    ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    : i + 1}
                </div>
                {/* Label */}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: step.done ? 600 : 400, color: step.done ? "var(--text-primary)" : "var(--text-muted)", lineHeight: 1.35 }}>{step.label}</div>
                  {step.done && step.at && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3 }}>{fmtDate(step.at)}</div>
                  )}
                  {!step.done && (
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, opacity: 0.5 }}>Pending</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="fade-in-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>

        {/* Payments */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Payments</span>
            <Link href="/portal/payments" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ padding: "18px 22px" }}>
            {totalDeal > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
                  <span>Progress</span>
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>{Math.round(payPct)}%</span>
                </div>
                <div style={{ height: 4, background: "var(--border)" }}>
                  <div style={{ height: 4, width: `${payPct}%`, background: "var(--gold)", transition: "width 0.5s" }} />
                </div>
              </div>
            )}
            {[
              { label: "Total",   v: fmt(totalDeal),  c: "var(--text-primary)" },
              { label: "Paid",    v: fmt(totalPaid),  c: "var(--success)" },
              { label: "Balance", v: remaining > 0 ? fmt(remaining) : "Fully Paid", c: remaining > 0 ? "var(--danger)" : "var(--success)" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{r.label}</span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: r.c }}>{r.v}</span>
              </div>
            ))}
            {lastPayment && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
                Last: {fmt(lastPayment.amount)} · {fmtDate(lastPayment.date)}
              </p>
            )}
          </div>
        </div>

        {/* Documents */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Documents</span>
            <Link href="/portal/documents" style={{ fontSize: 13, color: "var(--gold)", textDecoration: "none", fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ padding: "14px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ALL_TYPES.map(type => {
              const doc = safe.documents.find(d => d.type === type);
              return (
                <div key={type} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "9px 12px",
                  background: doc ? "var(--success-dim)" : "var(--bg-page)",
                  border: `1px solid ${doc ? "rgba(34,197,94,0.2)" : "var(--border)"}`,
                }}>
                  <div style={{
                    width: 6, height: 6, flexShrink: 0,
                    background: doc ? "var(--success)" : "var(--text-muted)",
                    opacity: doc ? 1 : 0.4,
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: doc ? "var(--text-primary)" : "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {DOC_LABELS[type]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
