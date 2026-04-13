export default function CookiePolicyPage() {
  const s = {
    fontSize: 15,
    color: "#b0accc",
    lineHeight: 1.85,
    marginBottom: 16,
  };

  const h = {
    fontFamily: "'Playfair Display', serif",
    fontSize: 22,
    fontWeight: 500,
    marginBottom: 14,
    marginTop: 52,
    color: "#F3F0FF",
  };

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
        .bold { color: #F3F0FF; font-weight: 500; }
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
          Legal
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(30px,4vw,48px)",
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: "-.01em",
            marginBottom: 14,
          }}
        >
          Cookie Policy
        </h1>

        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#4A4460",
            marginBottom: 48,
          }}
        >
          Last updated: April 2026
        </p>

        <div style={{ height: 1, background: "#251F38", marginBottom: 8 }} />

        <h2 style={h}>1. What This Policy Covers</h2>
        <p style={s}>
          This Cookie Policy explains how Aviora ("Aviora", "we", "us", or "our") may
          use cookies and similar tracking technologies when you access or use the
          Aviora platform, website, and related services (collectively, the "Service").
        </p>
        <p style={s}>
          This policy should be read alongside our Privacy Policy, which describes more
          broadly how we handle information collected through the Service.
        </p>

        <h2 style={h}>2. What Cookies Are</h2>
        <p style={s}>
          Cookies are small text files that are placed on your device when you visit a
          website or use a web-based service. They are widely used to make services
          function correctly, to remember preferences, and to provide analytical
          information to operators.
        </p>
        <p style={s}>
          Similar technologies — such as local storage, session storage, and device
          fingerprinting techniques — may serve comparable purposes. References to
          "cookies" in this policy include such similar technologies where the context
          applies.
        </p>

        <h2 style={h}>3. How We May Use Cookies</h2>
        <p style={s}>
          We may use cookies and similar technologies for the following purposes:
        </p>
        <p style={s}>
          <span className="bold">Essential functionality.</span> Some cookies are
          necessary for the Service to operate correctly. These may include cookies that
          manage authentication sessions, maintain login state, and enforce security
          measures. Without these, core features of the Service may not function.
        </p>
        <p style={s}>
          <span className="bold">Security.</span> We may use cookies to support security
          features, including detecting unusual or potentially fraudulent activity,
          helping to protect accounts, and enforcing usage policies.
        </p>
        <p style={s}>
          <span className="bold">Preferences and settings.</span> We may use cookies to
          remember settings or preferences you have selected, so that you do not need to
          configure them on each visit.
        </p>
        <p style={s}>
          <span className="bold">Analytics and service improvement.</span> We may use
          cookies or similar technologies to collect aggregated or anonymised information
          about how the Service is used — for example, which features are accessed, how
          users navigate the platform, and where errors occur. This information is used
          to maintain and improve the Service. Where third-party analytics tools are
          used for this purpose, data may be processed by those tools under their own
          terms.
        </p>

        <h2 style={h}>4. Third-Party Cookies</h2>
        <p style={s}>
          Certain third-party services integrated into the platform — such as payment
          processors or analytics providers — may place their own cookies on your
          device. These cookies are subject to the privacy and cookie policies of those
          third parties, not ours. We do not control the behaviour of third-party
          cookies.
        </p>

        <h2 style={h}>5. Your Choices</h2>
        <p style={s}>
          Most browsers allow you to view, manage, delete, and block cookies through
          their settings. You may also be able to set your browser to notify you when
          cookies are placed. The steps for managing cookies vary by browser; consult
          your browser's documentation for specific instructions.
        </p>
        <p style={s}>
          Please note that restricting or disabling cookies may affect the functionality
          of the Service. Essential cookies in particular are necessary for core
          features to operate, and disabling them may prevent you from accessing or
          using parts of the Service correctly.
        </p>
        <p style={s}>
          We do not currently respond to "Do Not Track" signals from browsers, as there
          is no consistent industry standard for how such signals should be interpreted.
        </p>

        <h2 style={h}>6. Changes to This Policy</h2>
        <p style={s}>
          We may update this Cookie Policy from time to time to reflect changes in the
          technologies we use or in applicable law. Where changes are material, we will
          take reasonable steps to provide notice. Continued use of the Service after
          any update constitutes your acceptance of the revised policy.
        </p>

        <h2 style={h}>7. Contact</h2>
        <p style={s}>
          If you have questions about our use of cookies or similar technologies, please
          contact us at{" "}
          <a className="lp-a" href="mailto:hello@aviora.studio">
            hello@aviora.studio
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
              ["About", "/about"],
              ["Privacy Policy", "/privacy-policy"],
              ["Terms of Service", "/terms-of-service"],
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
