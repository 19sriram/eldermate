import QRCode from "qrcode";

export async function renderQr(token: string): Promise<{ qrSvg: string; url: string }> {
  const url = `${process.env.APP_URL ?? "http://localhost:3000"}/t/${token}`;
  return { url, qrSvg: await QRCode.toString(url, { type: "svg", margin: 2 }) };
}
