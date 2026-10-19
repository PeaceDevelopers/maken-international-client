"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "@/lib/theme";

const navItems = [
  {
    href: "/portal",
    label: "Overview",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/portal/documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/portal/payments",
    label: "Payments",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: "/portal/profile",
    label: "Profile",
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{ color: "var(--text-muted)", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
        </svg>
      )}
    </button>
  );
}

export default function PortalNav({ userName, userImage }: { userName: string; userImage?: string | null }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = (href: string) => href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);
  const initials = userName.slice(0, 2).toUpperCase();

  const NavContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>

      {/* Logo */}
      <div style={{ padding: "20px 16px 18px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/icon-72x72.png" alt="" width={40} height={40} style={{ opacity: 0.95, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.01em", lineHeight: 1.25 }}>Maken International</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Client Portal</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-muted)", padding: "4px 12px 10px" }}>Menu</div>
        {navItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                marginBottom: 3,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--gold)" : "var(--text-secondary)",
                background: active ? "var(--gold-glow)" : "transparent",
                borderLeft: active ? "2px solid var(--gold)" : "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <span style={{ opacity: active ? 1 : 0.55, color: active ? "var(--gold)" : "inherit", flexShrink: 0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 8 }}>
          <div style={{
            width: 34, height: 34, flexShrink: 0,
            background: "var(--gold-glow)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "var(--gold)", overflow: "hidden",
          }}>
            {userImage
              ? <Image src={userImage} alt={userName} width={34} height={34} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              : initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Client</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "10px 12px", fontSize: 13, fontWeight: 500,
            color: "var(--text-secondary)", background: "transparent",
            border: "1px solid var(--border)", cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--danger)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--danger)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar — renders in normal flow above <main>, hidden on desktop */}
      <header className="lg:hidden" style={{
        position: "sticky", top: 0, zIndex: 30,
        height: 58,
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
      }}>
        <button onClick={() => setMobileOpen(true)} style={{ color: "var(--text-secondary)", padding: 6 }}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/icon-72x72.png" alt="" width={30} height={30} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)" }}>Maken Portal</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ThemeToggle />
          <div style={{
            width: 32, height: 32, background: "var(--gold-glow)", border: "1px solid var(--border-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "var(--gold)", overflow: "hidden",
          }}>
            {userImage
              ? <Image src={userImage} alt={userName} width={32} height={32} style={{ objectFit: "cover", width: "100%", height: "100%" }} />
              : initials}
          </div>
        </div>
      </header>

      {/* Desktop sidebar — fixed, full height, above content */}
      <aside className="lg:flex hidden" style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "var(--sidebar-w)", zIndex: 40,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        flexDirection: "column",
      }}>
        <NavContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 45 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside className="lg:hidden" style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: 240, zIndex: 50,
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1)",
        display: "flex", flexDirection: "column",
      }}>
        <NavContent />
      </aside>
    </>
  );
}
