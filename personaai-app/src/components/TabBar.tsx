"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const TABS = [
  {
    key: "discover",
    label: "Discover",
    href: "/discover",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    key: "collection",
    label: "Collection",
    href: "/collection",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: "studio",
    label: "Studio",
    href: "/studio",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    key: "plans",
    label: "Plans",
    href: "/plans",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    key: "out",
    label: "Out",
    href: "/signout",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 8px 12px",
        background: "linear-gradient(to top, rgba(6,6,16,0.98) 60%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          height: 1,
          marginBottom: 8,
          background:
            "linear-gradient(90deg, transparent, rgba(168,85,247,.35) 30%, rgba(236,72,153,.25) 60%, transparent)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "8px 4px",
          borderRadius: 22,
          background: "rgba(255,255,255,.04)",
          border: "1px solid rgba(255,255,255,.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 0 0 1px rgba(168,85,247,.08), 0 -4px 40px rgba(0,0,0,.5)",
        }}
      >
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/discover"
              ? pathname === "/discover" || pathname === "/"
              : pathname?.startsWith(tab.href) ?? false;

if (tab.key === "out") {
  return (
    <button
      key={tab.key}
      type="button"
      onClick={handleSignOut}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        padding: "6px 10px",
        borderRadius: 14,
        textDecoration: "none",
        color: "rgba(255,255,255,.38)",
        transition: "all 220ms ease",
        position: "relative",
        minWidth: 48,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          color: "rgba(255,255,255,.38)",
          transition: "color 220ms ease",
        }}
      >
        {tab.icon}
      </div>

      <span
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: 0.2,
          transition: "all 220ms ease",
          color: "rgba(255,255,255,.38)",
        }}
      >
        {tab.label}
      </span>
    </button>
  );
}

return (
  <Link
    key={tab.key}
    href={tab.href}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      padding: "6px 10px",
      borderRadius: 14,
      textDecoration: "none",
      color: isActive ? "rgba(255,255,255,.96)" : "rgba(255,255,255,.38)",
      transition: "all 220ms ease",
      position: "relative",
      minWidth: 48,
      background: isActive ? "rgba(168,85,247,.12)" : "transparent",
    }}
  >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: -1,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 2,
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, rgba(168,85,247,.9), rgba(236,72,153,.8))",
                    boxShadow: "0 0 10px rgba(168,85,247,.7)",
                  }}
                />
              )}

              <div
                style={{
                  color: isActive ? "rgba(168,85,247,1)" : "rgba(255,255,255,.38)",
                  transition: "color 220ms ease",
                }}
              >
                {tab.icon}
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: 0.2,
                  transition: "all 220ms ease",
                  background: isActive ? "linear-gradient(135deg, #a855f7, #ec4899)" : "none",
                  WebkitBackgroundClip: isActive ? "text" : "unset",
                  WebkitTextFillColor: isActive ? "transparent" : "inherit",
                  backgroundClip: isActive ? "text" : "unset",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
