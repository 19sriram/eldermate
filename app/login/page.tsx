"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [error, setError] = useState("");

  async function post(url: string, body: object) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return { ok: res.ok, data: await res.json() };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === "phone") {
      const r = await post("/api/auth/request-otp", { phone });
      if (r.ok) setStep("code");
      else setError(r.data.error ?? "Failed");
    } else {
      const r = await post("/api/auth/verify-otp", { phone, code });
      if (r.ok) router.push("/dashboard");
      else setError(r.data.error ?? "Failed");
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "0 auto", padding: 24 }}>
      <h1>Sign in</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        {step === "phone" ? (
          <input placeholder="+14155550123" value={phone} onChange={(e) => setPhone(e.target.value)} />
        ) : (
          <input placeholder="6-digit code (see server console)" value={code} onChange={(e) => setCode(e.target.value)} />
        )}
        <button type="submit">{step === "phone" ? "Send code" : "Verify"}</button>
        {error && <p style={{ color: "#b42318" }}>{error}</p>}
      </form>
    </main>
  );
}
