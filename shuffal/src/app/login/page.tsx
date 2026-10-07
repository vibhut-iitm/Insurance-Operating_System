"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/workspace");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <Link className="brand" href="/" aria-label="Return to Insurance-Operating_System home">
          <span className="brand-mark brand-mark-placeholder" role="img" aria-label="Blank logo image placeholder" />
          <span><strong>Insurance-Operating_System</strong><small>Sample insurance website</small></span>
        </Link>
        <h1>Welcome back.</h1>
        <p>Sign in to your workspace and pick up where you left off.</p>
        <form onSubmit={handleSubmit}>
          <label>Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p role="alert" className="login-error">{error}</p>}
          <button disabled={loading} className="button button-coral login-submit">{loading ? "Signing in..." : "Sign in to workspace"}</button>
        </form>
        <Link href="/" className="back-home">Return to sample site <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}