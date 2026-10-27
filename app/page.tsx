import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1>ElderMate</h1>
      <p>QR safety tags that alert a household without revealing who is connected.</p>
      <Link href="/dashboard">Owner dashboard</Link>
    </main>
  );
}
