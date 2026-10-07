"use client";

import { FormEvent, useState } from "react";
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
      router.replace("/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen place-items-center bg-[#f5f7f4] px-6 text-[#17352d]"><section className="w-full max-w-md rounded-xl border border-[#d9e3dd] bg-white p-8 shadow-[0_12px_30px_rgba(23,53,45,0.08)]"><div className="mb-8 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#d9e86c] text-lg font-bold">N</div><div><p className="text-lg font-semibold">Nivara</p><p className="text-xs text-[#668074]">Insurance OS</p></div></div><h1 className="text-2xl font-semibold">Sign in to your workspace</h1><p className="mt-2 text-sm text-[#668074]">Manage every customer file from one connected place.</p><form onSubmit={handleSubmit} className="mt-8 space-y-5"><label className="block text-sm font-medium">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-[#d9e3dd] px-3 py-2.5 outline-none focus:border-[#3b7560]" /></label><label className="block text-sm font-medium">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-[#d9e3dd] px-3 py-2.5 outline-none focus:border-[#3b7560]" /></label>{error && <p role="alert" className="rounded-lg bg-[#f9e0d8] px-3 py-2 text-sm text-[#a84d37]">{error}</p>}<button disabled={loading} className="w-full rounded-lg bg-[#17352d] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{loading ? "Signing in..." : "Sign in"}</button></form></section></main>;
}