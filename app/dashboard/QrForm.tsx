"use client";

import { useActionState } from "react";
import type { QrState } from "./actions";

type Props = {
  action: (prev: QrState, form: FormData) => Promise<QrState>;
  submitLabel: string;
  hidden?: Record<string, string>;
  withLabel?: boolean;
};

export default function QrForm({ action, submitLabel, hidden = {}, withLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <div>
      <form action={formAction} style={{ display: "flex", gap: 8 }}>
        {Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        {withLabel && <input name="label" placeholder="Label, e.g. Grandma's door" required />}
        <button disabled={pending}>{submitLabel}</button>
      </form>
      {state?.error && <p style={{ color: "#b42318" }}>{state.error}</p>}
      {state?.qrSvg && (
        <div style={{ marginTop: 12 }}>
          <p><strong>New QR generated.</strong></p>
          <div style={{ width: 220 }} dangerouslySetInnerHTML={{ __html: state.qrSvg }} />
          <a
            download="eldermate-tag.svg"
            href={`data:image/svg+xml;utf8,${encodeURIComponent(state.qrSvg)}`}
          >
            Download SVG
          </a>
        </div>
      )}
    </div>
  );
}
