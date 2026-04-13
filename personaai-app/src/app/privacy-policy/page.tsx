export default function PrivacyPolicyPage() {
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
          Privacy Policy
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

        <h2 style={h}>1. Introduction</h2>
        <p style={s}>
          This Privacy Policy describes how Aviora ("Aviora", "we", "us", or "our")
          may collect, use, store, and handle information when you access or use the
          Aviora platform, website, and related services (collectively, the "Service").
        </p>
        <p style={s}>
          By using the Service, you acknowledge that you have read and understood this
          policy. If you do not agree, you should not use the Service.
        </p>
        <p style={s}>
          We may update this policy from time to time. Where changes are material, we
          will take reasonable steps to provide notice. Continued use of the Service
          after updates constitutes your acceptance of the revised policy.
        </p>

        <h2 style={h}>2. Information We May Collect</h2>
        <p style={s}>
          Depending on how you interact with the Service, we may collect and process the
          following categories of information:
        </p>
        <p style={s}>
          <span className="bold">Account information.</span> When you register, we
          collect information such as your email address and authentication credentials.
          You may optionally provide additional profile details.
        </p>
        <p style={s}>
          <span className="bold">Billing and payment information.</span> Subscription
          payments are processed by third-party payment processors. We do not store full
          payment card details. We may retain billing-related records such as plan type,
          transaction identifiers, and billing history.
        </p>
        <p style={s}>
          <span className="bold">Usage and interaction data.</span> We may collect
          information about how you use the Service, including features accessed,
          content generated, settings configured, and actions taken within the platform.
        </p>
        <p style={s}>
          <span className="bold">Content inputs.</span> When you use generation
          features, we process the inputs you provide — such as images, text, or
          configuration data — to produce outputs. You are responsible for the content
          you submit.
        </p>
        <p style={s}>
          <span className="bold">Device and technical information.</span> We may collect
          technical data such as browser type, device type, IP address, and referring
          URLs that is transmitted as a standard part of internet communication.
        </p>
        <p style={s}>
          <span className="bold">Support communications.</span> If you contact us, we
          may retain records of that correspondence.
        </p>
        <p style={s}>
          <span className="bold">Cookies and similar technologies.</span> We may use
          cookies and similar technologies as described in our Cookie Policy.
        </p>

        <h2 style={h}>3. How We May Use Information</h2>
        <p style={s}>
          Information we collect may be used to: provide, operate, and maintain the
          Service; process transactions and manage subscriptions; authenticate accounts
          and enforce security; respond to support requests and communications; monitor
          for abuse, fraud, or violations of our Terms of Service; send transactional
          communications such as account confirmations, billing notices, and
          service-related updates; improve, test, and develop the Service; and comply
          with applicable legal obligations.
        </p>
        <p style={s}>
          We do not sell your personal information to third parties for their own
          independent marketing or advertising purposes.
        </p>

        <h2 style={h}>4. Sharing of Information</h2>
        <p style={s}>
          <span className="bold">Service providers.</span> We work with third-party
          vendors and service providers that assist us in operating the Service,
          including hosting, infrastructure, payment processing, email delivery, and
          analytics. These parties are expected to handle information only as directed
          and for the purposes we specify.
        </p>
        <p style={s}>
          <span className="bold">AI and generation providers.</span> The Service relies
          on third-party AI model and infrastructure providers to process generation
          requests. Content inputs you provide may be transmitted to such providers to
          produce outputs. We cannot provide an exhaustive list of all underlying
          providers, as these may change as the Service evolves.
        </p>
        <p style={s}>
          <span className="bold">Legal obligations.</span> We may disclose information
          where required by applicable law, regulation, court order, or government
          authority, or where disclosure is reasonably necessary to protect the rights,
          property, or safety of Aviora, our users, or others.
        </p>
        <p style={s}>
          <span className="bold">Business transfers.</span> In connection with a merger,
          acquisition, reorganisation, or sale of assets, information may be transferred
          as part of that transaction. We will take reasonable steps to notify you if
          such a transfer materially affects the handling of your information.
        </p>

        <h2 style={h}>5. Data Retention</h2>
        <p style={s}>
          We retain information for as long as reasonably necessary to provide the
          Service, fulfil the purposes described in this policy, comply with applicable
          legal obligations, resolve disputes, and enforce our agreements. When
          information is no longer required for these purposes, we take reasonable steps
          to delete or de-identify it. Specific retention periods vary depending on the
          category of information and the purpose for which it was collected.
        </p>

        <h2 style={h}>6. Security</h2>
        <p style={s}>
          We implement technical and organisational measures that we consider reasonable
          and appropriate to protect information against unauthorised access, disclosure,
          alteration, or destruction. However, no system is completely secure, and we
          cannot guarantee the absolute security of your information. You are
          responsible for maintaining the security of your account credentials.
        </p>

        <h2 style={h}>7. Third-Party Services</h2>
        <p style={s}>
          The Service may integrate with or rely upon third-party services. Your use of
          the Service may involve the transmission of data to such third parties. We are
          not responsible for the privacy practices of third-party services. We
          encourage you to review the applicable privacy policies of any third-party
          services you interact with in connection with the Service.
        </p>

        <h2 style={h}>8. International Data Transfers</h2>
        <p style={s}>
          Information we collect may be processed, stored, or accessed in countries
          other than the country in which you are located. Those countries may have data
          protection laws that differ from those in your jurisdiction. Where information
          is transferred internationally, we take reasonable steps to ensure it is
          handled with an appropriate level of protection, consistent with this policy
          and applicable law.
        </p>

        <h2 style={h}>9. Your Choices</h2>
        <p style={s}>
          You may update certain account information by accessing your account settings.
          You may request deletion of your account by contacting us at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>
          . We will process such requests in accordance with applicable law and our
          operational requirements. Some information may be retained after account
          deletion where required by legal obligation or legitimate operational
          necessity.
        </p>
        <p style={s}>
          You may manage cookie and tracking preferences through your browser or device
          settings, subject to the limitations described in our Cookie Policy.
        </p>

        <h2 style={h}>10. Children</h2>
        <p style={s}>
          The Service is not directed at individuals under the age of 18. We do not
          knowingly collect personal information from minors. If you believe we have
          inadvertently collected information from a minor, please contact us and we
          will take reasonable steps to address it.
        </p>

        <h2 style={h}>11. Contact</h2>
        <p style={s}>
          If you have questions or concerns about this Privacy Policy or our handling of
          your information, please contact us at{" "}
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
