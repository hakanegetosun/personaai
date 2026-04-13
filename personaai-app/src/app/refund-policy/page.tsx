export default function RefundPolicyPage() {
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
          Refund Policy
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

        <h2 style={h}>1. Overview</h2>
        <p style={s}>
          This Refund Policy applies to all paid subscriptions and purchases made
          through the Aviora platform and website (collectively, the "Service"). Please
          read it carefully before subscribing.
        </p>
        <p style={s}>
          Aviora provides access to a digital software platform. Given the nature of
          digital services, and consistent with standard practice for SaaS products,
          fees paid for the Service are generally non-refundable except as expressly
          described in this policy or as required by applicable law.
        </p>

        <h2 style={h}>2. Subscription Fees</h2>
        <p style={s}>
          When you subscribe to a paid plan, you are billed in advance for the
          applicable billing period — monthly or as otherwise stated at the point of
          purchase. Subscription fees are charged at the start of each billing cycle.
        </p>
        <p style={s}>
          Fees charged for completed billing periods are non-refundable. This applies
          regardless of whether you actively used the Service during that period,
          whether you were satisfied with the Service, or whether your usage was lower
          than anticipated.
        </p>
        <p style={s}>
          Cancellation of your subscription stops future billing from the end of your
          current billing period. It does not entitle you to a refund or credit for any
          portion of fees already charged.
        </p>

        <h2 style={h}>3. Cancellation</h2>
        <p style={s}>
          You may cancel your subscription at any time through your account settings or
          by contacting us at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>
          . Upon cancellation, your access to paid features will continue until the end
          of the current billing period, after which your plan will not renew.
        </p>
        <p style={s}>
          Cancellation does not create a right to any refund for the current or any
          prior billing period. If you cancel partway through a billing cycle, you
          retain access to the Service for the remainder of that cycle and will not be
          charged for subsequent cycles.
        </p>

        <h2 style={h}>4. Exceptional Circumstances</h2>
        <p style={s}>
          We may, at our sole discretion, consider refund or credit requests in
          exceptional circumstances, such as where a charge occurred in clear error —
          for example, a duplicate billing event caused by a technical fault on our
          part.
        </p>
        <p style={s}>
          Dissatisfaction with the Service, a change in your personal or business
          circumstances, underuse of the platform, or disagreement with a product
          decision does not, by itself, constitute grounds for a refund.
        </p>
        <p style={s}>
          If you believe a charge was made in error, please contact us at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>{" "}
          within a reasonable time of the charge, with details of the issue. We will
          review the matter on a case-by-case basis. Contacting us does not create an
          obligation on our part to issue a refund.
        </p>

        <h2 style={h}>5. Statutory Rights</h2>
        <p style={s}>
          Nothing in this policy limits or excludes any statutory rights you may have
          under applicable consumer protection law in your jurisdiction. Where local law
          requires us to offer a refund or cooling-off period, we will comply with
          those requirements. If you are uncertain whether statutory rights apply to
          your purchase, you may wish to seek independent advice.
        </p>

        <h2 style={h}>6. Chargebacks and Disputes</h2>
        <p style={s}>
          If you initiate a chargeback or payment dispute with your bank or card issuer
          in circumstances that are not consistent with this policy or our Terms of
          Service, we reserve the right to suspend or terminate your account and to take
          reasonable steps to recover the disputed amount. We encourage you to contact
          us directly at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>{" "}
          before initiating any dispute with your payment provider.
        </p>

        <h2 style={h}>7. Add-On Purchases</h2>
        <p style={s}>
          Any additional content generation credits, feature packs, or add-on purchases
          made through the Service are non-refundable once the associated generation
          process has commenced or the credits have been applied to your account. If an
          add-on was purchased in clear error and has not yet been used, you may contact
          us to discuss the matter, but we are not obligated to issue a refund.
        </p>

        <h2 style={h}>8. Contact</h2>
        <p style={s}>
          For questions or concerns regarding billing, charges, or this policy, please
          contact us at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>
          . For general enquiries, you may also reach us at{" "}
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
              ["Cookie Policy", "/cookie-policy"],
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
