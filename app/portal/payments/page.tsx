import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function PaymentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: { deal: { include: { payments: { orderBy: { date: "desc" } } } } },
  });
  if (!client) redirect("/login");

  const deal = client.deal;
  const payments = deal?.payments ?? [];
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalDeal = deal?.totalAmount ?? 0;
  const remaining = totalDeal - totalPaid;
  const pct = totalDeal > 0 ? Math.min(100, (totalPaid / totalDeal) * 100) : 0;

  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header + big stat ── */}
      <div className="fade-in" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>Payments</h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Your payment history and balance</p>
        </div>
        {totalDeal > 0 && (
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", color: pct >= 100 ? "var(--success)" : "var(--gold)" }}>
              {Math.round(pct)}%
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 1 }}>paid</div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="fade-in-1 grid grid-cols-1 sm:grid-cols-3" style={{ gap: 1, background: "var(--border)" }}>
        {[
          { label: "Total Agreement", value: fmt(totalDeal),  color: "var(--text-primary)" },
          { label: "Amount Paid",     value: fmt(totalPaid),  color: "var(--success)" },
          { label: "Balance Due",     value: remaining > 0 ? fmt(remaining) : "Fully Paid", color: remaining > 0 ? "var(--danger)" : "var(--success)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-surface)", padding: "20px 24px" }}>
            <div className="label-caps" style={{ marginBottom: 8 }}>{s.label}</div>
            <div className="stat-num mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Progress bar ── */}
      {totalDeal > 0 && (
        <div className="fade-in-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", padding: "18px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
            <span style={{ color: "var(--text-secondary)" }}>Payment progress</span>
            <span className="mono" style={{ fontWeight: 700, color: "var(--gold)" }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${pct}%`, background: "var(--gold)", transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13, color: "var(--text-muted)" }}>
            <span>{fmt(totalPaid)} paid</span>
            <span>{remaining > 0 ? fmt(remaining) + " remaining" : "Fully settled"}</span>
          </div>
        </div>
      )}

      {/* ── History ── */}
      <div className="fade-in-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>History</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)", padding: "5px 10px", border: "1px solid var(--border)" }}>
            {payments.length} record{payments.length !== 1 ? "s" : ""}
          </span>
        </div>

        {payments.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1} style={{ margin: "0 auto 12px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No payments recorded yet</p>
          </div>
        ) : (
          <div>
            {payments.map((p, i) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 20px",
                borderBottom: i < payments.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <div className="mono" style={{
                  width: 32, height: 32, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: "var(--success)", letterSpacing: "-0.02em" }}>{fmt(p.amount)}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
                    {fmtDate(p.date)}{p.note ? ` · ${p.note}` : ""}
                  </div>
                </div>
                <div style={{ width: 6, height: 6, flexShrink: 0, background: "var(--success)", opacity: 0.6 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
