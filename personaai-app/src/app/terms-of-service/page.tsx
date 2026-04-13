export default function TermsOfServicePage() {
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

  const bullet = {
    fontSize: 15,
    color: "#b0accc",
    lineHeight: 1.85,
    marginBottom: 10,
    paddingLeft: 20,
    borderLeft: "2px solid #251F38",
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
          Terms of Service
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

        <h2 style={h}>1. Agreement to These Terms</h2>
        <p style={s}>
          These Terms of Service ("Terms") govern your access to and use of the Aviora
          platform, website, and related services (collectively, the "Service")
          provided by Aviora ("Aviora", "we", "us", or "our").
        </p>
        <p style={s}>
          By creating an account, accessing, or using the Service in any way, you agree
          to be bound by these Terms and our Privacy Policy, which is incorporated by
          reference. If you do not agree, you must not use the Service.
        </p>
        <p style={s}>
          We may update these Terms from time to time. Where changes are material, we
          will take reasonable steps to provide notice. Continued use of the Service
          after any update constitutes your acceptance of the revised Terms.
        </p>

        <h2 style={h}>2. Eligibility</h2>
        <p style={s}>
          You must be at least 18 years of age to use the Service. By using the
          Service, you represent and warrant that you meet this requirement and that
          you have the legal capacity to enter into a binding agreement. If you are
          using the Service on behalf of an organisation, you represent that you have
          authority to bind that organisation to these Terms.
        </p>

        <h2 style={h}>3. Accounts</h2>
        <p style={s}>
          To access the Service, you must register for an account. You agree to provide
          accurate and complete information at registration and to keep that information
          current. You are solely responsible for maintaining the confidentiality of
          your account credentials and for all activity that occurs under your account.
        </p>
        <p style={s}>
          You must notify us promptly at{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>{" "}
          if you become aware of any unauthorised access to or use of your account. We
          are not liable for any loss or damage arising from your failure to maintain
          the security of your credentials.
        </p>
        <p style={s}>
          You may not share, transfer, or otherwise permit others to use your account.
          Each account is for individual use unless a plan type expressly provides
          otherwise.
        </p>

        <h2 style={h}>4. Subscriptions and Payment</h2>
        <p style={s}>
          Access to certain features of the Service requires a paid subscription.
          Subscription fees are charged on a recurring basis in accordance with the
          billing cycle applicable to your plan. All fees are stated in US dollars
          unless otherwise specified at the point of purchase.
        </p>
        <p style={s}>
          By subscribing, you authorise us to charge your payment method on a recurring
          basis until you cancel your subscription or your account is terminated. You
          are responsible for ensuring that your payment information remains accurate
          and current.
        </p>
        <p style={s}>
          Fees are generally non-refundable except as expressly set out in our Refund
          Policy or as required by applicable law. Cancellation stops future billing but
          does not, by itself, entitle you to a refund of previously charged amounts.
        </p>
        <p style={s}>
          We reserve the right to change pricing, plan structures, and features
          included in any plan at any time. Where a price change affects an existing
          subscription, we will provide reasonable advance notice. Continued use of the
          Service after a price change takes effect constitutes acceptance of the
          revised pricing.
        </p>
        <p style={s}>
          If a payment fails, is disputed, or is subject to a chargeback, we may
          suspend or terminate your access to the Service until the matter is resolved.
        </p>

        <h2 style={h}>5. Acceptable Use</h2>
        <p style={s}>
          You agree to use the Service only for lawful purposes and in accordance with
          these Terms. You are solely responsible for your use of the Service and for
          any content you submit, generate, or publish.
        </p>
        <p style={s}>You must not use the Service to:</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {[
            "violate any applicable law, regulation, or third-party right, including intellectual property rights, privacy rights, publicity rights, or data protection obligations;",
            "submit, generate, or distribute content that is unlawful, fraudulent, defamatory, harassing, abusive, obscene, or otherwise objectionable;",
            "impersonate any person or entity, or misrepresent your affiliation with any person or entity;",
            "submit or generate content depicting or exploiting minors in any manner;",
            "attempt to reverse engineer, decompile, disassemble, or otherwise extract source code or underlying models from the Service;",
            "use automated means to access or scrape the Service without our prior written consent;",
            "attempt to circumvent any access controls, usage limits, or security measures of the Service;",
            "use outputs from the Service to train, fine-tune, or develop competing AI systems or services without our prior written consent;",
            "interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure.",
          ].map((item, i) => (
            <p key={i} style={bullet}>
              {item}
            </p>
          ))}
        </div>

        <h2 style={h}>6. User Inputs and Generated Outputs</h2>
        <p style={s}>
          You retain ownership of the inputs you submit to the Service. By submitting
          inputs, you grant us a limited licence to process those inputs solely as
          necessary to provide the Service to you.
        </p>
        <p style={s}>
          Subject to these Terms and your compliance with them, we grant you a
          non-exclusive, non-transferable right to use outputs generated by the Service
          for your own purposes. We make no representation that generated outputs are
          unique, accurate, complete, non-infringing, lawful, suitable for publication,
          or fit for any particular purpose.
        </p>
        <p style={s}>
          You are solely responsible for reviewing all generated outputs before any use
          or publication. You must not use outputs in ways that infringe the rights of
          others, violate applicable law, or breach the terms of any third-party
          platform on which you choose to publish content.
        </p>
        <p style={s}>
          You represent and warrant that any inputs you submit do not infringe
          third-party intellectual property rights, do not contain unlawful material,
          and do not violate any applicable law or regulation. You are solely
          responsible for your inputs and their consequences.
        </p>

        <h2 style={h}>7. Third-Party Platforms</h2>
        <p style={s}>
          The Service may be used in connection with third-party platforms such as
          TikTok and Instagram. We have no affiliation with, and make no representations
          regarding, the availability, content policies, or terms of any third-party
          platform.
        </p>
        <p style={s}>
          Compliance with the terms of service, community standards, advertising rules,
          disclosure obligations, and applicable laws of any third-party platform is
          your sole responsibility. We do not guarantee that content generated using the
          Service will be accepted, approved, or treated as compliant by any third-party
          platform, and we accept no liability arising from any third-party platform's
          decisions, enforcement actions, or policy changes.
        </p>

        <h2 style={h}>8. Intellectual Property</h2>
        <p style={s}>
          The Service, including its software, design, user interface, branding,
          underlying models, and documentation, is owned by or licensed to Aviora and
          is protected by applicable intellectual property laws. Nothing in these Terms
          transfers any ownership of our intellectual property to you.
        </p>
        <p style={s}>
          The Aviora name, logo, and associated marks are proprietary to Aviora. You
          may not use them without our prior written consent.
        </p>
        <p style={s}>
          If you submit feedback, suggestions, or ideas about the Service, you grant us
          a perpetual, irrevocable, royalty-free, worldwide licence to use, develop,
          and incorporate such feedback without restriction or compensation to you.
        </p>

        <h2 style={h}>9. No Guarantee of Results</h2>
        <p style={s}>
          The Service is provided as a creative workflow and generation tool. We make no
          representation, warranty, or guarantee regarding any outcome, including
          content performance, platform engagement, audience growth, monetisation, or
          commercial results of any kind. Results depend on many factors entirely
          outside our control, and nothing in these Terms or elsewhere on the Service
          should be read as a promise of any particular outcome.
        </p>

        <h2 style={h}>10. Disclaimers</h2>
        <p style={s}>
          The Service is provided "as is" and "as available" without warranties of any
          kind, whether express or implied. To the fullest extent permitted by
          applicable law, we disclaim all implied warranties, including warranties of
          merchantability, fitness for a particular purpose, title, and
          non-infringement.
        </p>
        <p style={s}>
          We do not warrant that the Service will be uninterrupted, error-free, or free
          of harmful components. We do not warrant that generated outputs will be
          accurate, complete, appropriate, or suitable for any particular use. We do not
          warrant compatibility with any specific device, browser, operating system, or
          third-party platform.
        </p>

        <h2 style={h}>11. Limitation of Liability</h2>
        <p style={s}>
          To the fullest extent permitted by applicable law, Aviora and its officers,
          directors, employees, and agents shall not be liable for any indirect,
          incidental, special, consequential, punitive, or exemplary damages, including
          loss of profits, revenue, data, goodwill, or business opportunity, arising out
          of or in connection with your use of or inability to use the Service, even if
          we have been advised of the possibility of such damages.
        </p>
        <p style={s}>
          To the fullest extent permitted by applicable law, our total aggregate
          liability to you for any claims arising out of or relating to these Terms or
          the Service shall not exceed the total amount you have paid to us in the
          twelve (12) months immediately preceding the event giving rise to the claim,
          or one hundred US dollars (USD 100), whichever is greater.
        </p>
        <p style={s}>
          Some jurisdictions do not permit the exclusion or limitation of certain
          warranties or liabilities. In such jurisdictions, our liability is limited to
          the fullest extent permitted by applicable law.
        </p>

        <h2 style={h}>12. Indemnification</h2>
        <p style={s}>
          You agree to indemnify, defend, and hold harmless Aviora and its officers,
          directors, employees, and agents from and against any claims, damages, losses,
          liabilities, costs, and expenses (including reasonable legal fees) arising out
          of or relating to: your use of the Service; your inputs or outputs; your
          violation of these Terms; your violation of any applicable law or third-party
          right; or any content you create, publish, or distribute using outputs from
          the Service.
        </p>

        <h2 style={h}>13. Suspension and Termination</h2>
        <p style={s}>
          We may suspend or terminate your access to the Service at any time, with or
          without notice, if we reasonably believe you have violated these Terms,
          engaged in fraudulent or abusive conduct, or if required by applicable law or
          regulation.
        </p>
        <p style={s}>
          You may cancel your subscription at any time through your account settings or
          by contacting{" "}
          <a className="lp-a" href="mailto:support@aviora.studio">
            support@aviora.studio
          </a>
          . Cancellation takes effect at the end of your current billing period unless
          otherwise stated. Cancellation does not entitle you to a refund of any
          previously charged fees except as set out in our Refund Policy or as required
          by applicable law.
        </p>
        <p style={s}>
          Upon termination for any reason, your right to access the Service ceases
          immediately. Provisions that by their nature should survive termination will do
          so, including sections on intellectual property, disclaimers, limitation of
          liability, indemnification, and general terms.
        </p>

        <h2 style={h}>14. Modifications to the Service</h2>
        <p style={s}>
          We reserve the right to modify, suspend, or discontinue any part of the
          Service at any time, with or without notice. This includes adding, changing,
          or removing features, adjusting usage limits, and updating plan contents. We
          are not liable to you or any third party for any modification, suspension, or
          discontinuation of the Service or any part of it.
        </p>

        <h2 style={h}>15. General</h2>
        <p style={s}>
          These Terms, together with our Privacy Policy, Cookie Policy, and Refund
          Policy, constitute the entire agreement between you and Aviora regarding the
          Service and supersede any prior agreements or understandings on the same
          subject matter.
        </p>
        <p style={s}>
          If any provision of these Terms is found to be invalid or unenforceable, the
          remaining provisions will continue in full force and effect. Our failure to
          enforce any right or provision does not constitute a waiver of that right or
          provision.
        </p>
        <p style={s}>
          We may assign our rights and obligations under these Terms without
          restriction. You may not assign your rights or obligations without our prior
          written consent.
        </p>

        <h2 style={h}>16. Contact</h2>
        <p style={s}>
          For questions about these Terms, please contact us at{" "}
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
