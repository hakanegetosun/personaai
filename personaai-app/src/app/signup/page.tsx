"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import styles from "./auth.module.css";

export default function SignupPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleSignup() {
    if (!email || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/login`
            : undefined,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess("Account created. Check your email to confirm your account.");
    setLoading(false);

    window.setTimeout(() => {
      router.replace("/login");
    }, 1800);
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

        <h1 className={styles.heading}>Create your creator workspace</h1>
        <p className={styles.subheading}>
          Start building personas, generating reels, and keeping identity consistent across every output.
        </p>

        <div className={styles.info}>
          Create personas, generate reels, and keep identity more consistent across your content.
        </div>

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
            <label className={styles.label} htmlFor={passwordId}>Password</label>
            <input
              id={passwordId}
              className={styles.input}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor={confirmPasswordId}>Confirm password</label>
            <input
              id={confirmPasswordId}
              className={styles.input}
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.info}>{success}</p>}

          <button
            type="button"
            className={styles.button}
            onClick={() => void handleSignup()}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Already have an account?</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.footerRow}>
          <span className={styles.footerText}>Already signed up?</span>
          <Link className={styles.footerLink} href="/login">
            Sign in
          </Link>
        </div>

        <p className={styles.legal}>
          By creating an account you agree to our <a href="/terms">Terms</a> and{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
