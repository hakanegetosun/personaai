export default function AboutPage() {
  return (
    <div
      style={{
        background: "#0C0A13",
        color: "#F3F0FF",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 300,
        lineHeight: 1.6,
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        .lp-a { color: #9B6DFF; text-decoration: none; }
        .lp-a:hover { text-decoration: underline; }
        .fl { font-size: 12px; color: #4A4460; text-decoration: none; }
        .fl:hover { color: #7A7290; }
      `}</style>

      <nav
        style={{
          padding: "0 40px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #251F38",
          background: "rgba(12,10,19,.96)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 600,
            color: "#F3F0FF",
            textDecoration: "none",
          }}
        >
          Aviora
        </a>
        <a
          href="https://app.aviora.studio/signup"
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: "linear-gradient(135deg,#A855F7,#EC4899)",
            padding: "9px 22px",
            borderRadius: 20,
            textDecoration: "none",
          }}
        >
          Get Started
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 40px 120px" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#9B6DFF",
            marginBottom: 20,
          }}
        >
          About
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px,4vw,52px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-.01em",
            marginBottom: 32,
          }}
        >
          Built for creators who take
          <br />
          their output seriously.
        </h1>

        <div style={{ height: 1, background: "#251F38", marginBottom: 48 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <p style={{ fontSize: 16, color: "#b0accc", lineHeight: 1.85, margin: 0 }}>
            Aviora is a premium AI-assisted creator platform designed to support content creators
            working on TikTok and Instagram. The platform provides tools for persona management,
            trend discovery, and AI-assisted content generation — giving creators a structured,
            controlled workflow rather than a generic generation interface.
          </p>
          <p style={{ fontSize: 16, color: "#b0accc", lineHeight: 1.85, margin: 0 }}>
            The platform is built on the principle that creator identity matters. Generation is
            organised around a defined persona — a creative profile that informs how content is
            structured, styled, and presented. Creators retain full responsibility for reviewing,
            editing, and approving all outputs before any use or publication.
          </p>
          <p style={{ fontSize: 16, color: "#b0accc", lineHeight: 1.85, margin: 0 }}>
            Aviora is under active development. Features, capabilities, and availability may change
            over time. We are focused on output quality, reliability, and building tools suited to
            professional and semi-professional creators working at a consistent pace.
          </p>
          <p style={{ fontSize: 16, color: "#b0accc", lineHeight: 1.85, margin: 0 }}>
            We do not make claims about content performance, audience growth, platform outcomes, or
            commercial results. Aviora is a workflow and generation tool. Results depend on many
            factors outside our control, and we do not overstate what the product does.
          </p>
        </div>

        <div style={{ height: 1, background: "#251F38", margin: "56px 0" }} />

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#9B6DFF",
            marginBottom: 28,
          }}
        >
          What We Focus On
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(
            [
              [
                "Creator control",
                "Aviora assists; creators decide. Every output passes through your review before it goes anywhere.",
              ],
              [
                "Output quality",
                "We prioritise quality over volume. Features like Allure Mode and Identity Lock are designed to raise the standard of AI-assisted creator content on paid plans.",
              ],
              [
                "Workflow structure",
                "Good content begins with context. Aviora organises generation around structured briefs and persona profiles rather than open-ended prompts.",
              ],
              [
                "Honest positioning",
                "We describe the platform as it is. We do not overstate capabilities, invent guarantees, or promise outcomes we cannot control.",
              ],
            ] as [string, string][]
          ).map(([title, body]) => (
            <div
              key={title}
              style={{
                background: "#141120",
                border: "1px solid #251F38",
                borderRadius: 8,
                padding: "24px 28px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 17,
                  fontWeight: 500,
                  marginBottom: 10,
                }}
              >
                {title}
              </div>
              <p style={{ fontSize: 14, color: "#7A7290", lineHeight: 1.75, margin: 0 }}>
                {body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "#251F38", margin: "56px 0" }} />

        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#9B6DFF",
            marginBottom: 20,
          }}
        >
          Contact
        </div>

        <p style={{ fontSize: 15, color: "#b0accc", lineHeight: 1.85, marginBottom: 12 }}>
          For general enquiries, contact us at{" "}
          <a className="lp-a" href="mailto:hello@aviora.studio">
            hello@aviora.studio
          </a>
          .
        </p>
        <p style={{ fontSize: 15, color: "#b0accc", lineHeight: 1.85, margin: 0 }}>
          For account or technical support, contact{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>
          .
        </p>
      </div>

      <footer
        style={{
          borderTop: "1px solid #251F38",
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: "#4A4460",
            letterSpacing: ".08em",
          }}
        >
          2026 Aviora. All rights reserved.
        </span>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          {(
            [
              ["Privacy Policy", "/privacy-policy"],
              ["Terms of Service", "/terms-of-service"],
              ["Cookie Policy", "/cookie-policy"],
              ["Refund Policy", "/refund-policy"],
            ] as [string, string][]
          ).map(([label, href]) => (
            <a key={href} href={href} className="fl">
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
