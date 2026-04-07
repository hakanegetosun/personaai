"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./auth.module.css";

export default function ForgotPasswordPage() {
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleReset() {
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password reset email sent. Check your inbox.");
    setLoading(false);
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orb1}`} />
      <div className={`${styles.orb} ${styles.orb2}`} />

      <div className={styles.card}>
        <div className={styles.brandRow}>
          <div className={styles.logomark}>P</div>
          <div className={styles.wordmark}>
            Persona<span>AI</span>
          </div>
        </div>

        <h1 className={styles.heading}>Reset your password</h1>
        <p className={styles.subheading}>
          Enter your email and we’ll send you a secure reset link.
        </p>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={emailId}>Email</label>
            <input
              id={emailId}
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.info}>{message}</p>}

          <button
            type="button"
            className={styles.button}
            onClick={() => void handleReset()}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </div>

        <div className={styles.footerRow}>
          <Link className={styles.footerLink} href="/login">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
