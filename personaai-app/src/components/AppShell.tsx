"use client";

import React from "react";
import TabBar from "@/components/TabBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse 900px 700px at 30% -10%, rgba(120,40,200,.18), transparent 65%)," +
          "radial-gradient(ellipse 700px 500px at 80% 110%, rgba(99,102,241,.12), transparent 65%)," +
          "linear-gradient(180deg, #060610 0%, #050510 100%)",
        fontFamily:
          "'DM Sans', 'Syne', ui-sans-serif, system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background:
            "radial-gradient(ellipse 500px 400px at 60% -5%, rgba(168,85,247,.13), transparent 60%)," +
            "radial-gradient(ellipse 400px 350px at 20% 110%, rgba(236,72,153,.09), transparent 60%)," +
            "linear-gradient(180deg, #0a0a1a 0%, #070712 60%, #060610 100%)",
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>

        <TabBar />
      </div>
    </div>
  );
}
