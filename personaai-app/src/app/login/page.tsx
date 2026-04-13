"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./auth.module.css";

export default function LoginPage() {
  const router = useRouter();
const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError("Incorrect email or password. Please try again.");
      setLoading(false);
      return;
    }

let nextPath = "/onboarding";

if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  nextPath = params.get("next") || "/onboarding";
}

router.replace(nextPath);
router.refresh();
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

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>
          Sign in to continue creating with your personas.
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

          <div className={styles.field}>
            <div className={styles.rowBetween}>
              <label className={styles.label} htmlFor={passwordId}>Password</label>
              <Link className={styles.inlineLink} href="/forgot-password">
                Forgot password?
              </Link>
            </div>
            <input
              id={passwordId}
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="button"
            className={styles.button}
            onClick={() => void handleLogin()}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>New to PersonaAI?</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.footerRow}>
          <span className={styles.footerText}>Don't have an account?</span>
          <Link className={styles.footerLink} href="/signup">
            Create one free
          </Link>
        </div>

        <p className={styles.legal}>
          By continuing you agree to our <a href="/terms">Terms</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
