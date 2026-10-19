import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, username: true, email: true,
      eNumber: true, passportNumber: true, image: true, createdAt: true,
      documents: { select: { type: true } },
      deal: { select: { totalAmount: true, payments: true } },
    },
  });
  if (!client) redirect("/login");

  const totalPaid = client.deal?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  const totalDeal = client.deal?.totalAmount ?? 0;
  const remaining = totalDeal - totalPaid;
  const fmt = (n: number) => "Rs. " + n.toLocaleString("en-IN");
  const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const rows = [
    { label: "Full Name",       value: client.name },
    { label: "Username",        value: `@${client.username}` },
    { label: "Email",           value: client.email },
    { label: "E Number",        value: client.eNumber || "Not assigned" },
    { label: "Passport",        value: client.passportNumber || "Not registered" },
    { label: "Member Since",    value: fmtDate(client.createdAt) },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Header ── */}
      <div className="fade-in">
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1.1 }}>Profile</h1>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Your account information</p>
      </div>

      {/* ── Identity card ── */}
      <div className="fade-in-1" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", display: "flex", alignItems: "stretch" }}>
        {/* Gold stripe */}
        <div style={{ width: 3, background: "var(--gold)", flexShrink: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "24px 28px", flex: 1 }}>
          <div style={{
            width: 64, height: 64, flexShrink: 0,
            background: "var(--gold-glow)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "var(--gold)", overflow: "hidden",
          }}>
            {client.image
              ? <Image src={client.image} alt={client.name} width={64} height={64} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              : client.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{client.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>@{client.username}</div>
            <div style={{
              marginTop: 8, display: "inline-block",
              padding: "3px 8px", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "var(--gold)", border: "1px solid var(--border-accent)", background: "var(--gold-glow)",
            }}>
              Active Client
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="fade-in-2 grid grid-cols-3" style={{ gap: 1, background: "var(--border)" }}>
        {[
          { label: "Documents",   value: `${client.documents.length}/${8}` },
          { label: "Payments",    value: `${client.deal?.payments.length ?? 0}` },
          { label: "Balance",     value: remaining > 0 ? fmt(remaining) : "Paid ✓" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-surface)", padding: "16px 20px", textAlign: "center" }}>
            <div className="label-caps" style={{ marginBottom: 6 }}>{s.label}</div>
            <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.03em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Details table ── */}
      <div className="fade-in-3" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Account Details</span>
        </div>
        {rows.map(({ label, value }, i) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", flexShrink: 0 }}>{label}</span>
            <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", textAlign: "right", marginLeft: 16, wordBreak: "break-all" }}>{value}</span>
          </div>
        ))}
      </div>

      <p className="fade-in-4" style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", paddingBottom: 8 }}>
        Contact your agent to update profile information.
      </p>
    </div>
  );
}
