"use client";

import { useState } from "react";

type Result = "idle" | "sending" | "sent" | "already_notified" | "error";

export default function AlertButtons({ token }: { token: string }) {
  const [note, setNote] = useState("");
  const [result, setResult] = useState<Result>("idle");

  async function send(type: "PACKAGE" | "EMERGENCY") {
    setResult("sending");
    try {
      const res = await fetch("/api/alert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, type, note }),
      });
      const data = await res.json();
      setResult(res.ok && data.ok ? data.status : "error");
    } catch {
      setResult("error");
    }
  }

  if (result === "sent") return <p>Thank you. The household has been notified.</p>;
  if (result === "already_notified") {
    return <p>The household has already been notified recently. Thank you.</p>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <textarea
        placeholder="Optional short note"
        maxLength={200}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ padding: 8, fontSize: 16 }}
      />
      <button disabled={result === "sending"} onClick={() => send("PACKAGE")} style={btn}>
        I&apos;m delivering a package
      </button>
      <button
        disabled={result === "sending"}
        onClick={() => send("EMERGENCY")}
        style={{ ...btn, background: "#b42318", color: "#fff" }}
      >
        This person needs help
      </button>
      {result === "error" && <p>Something went wrong. Please try again.</p>}
    </div>
  );
}

const btn: React.CSSProperties = { padding: 16, fontSize: 18, borderRadius: 8, border: "1px solid #999" };
