import Link from 'next/link';
import { useState, useContext } from 'react';
import { AuthContext } from './_app';

export default function Home() {
  const [msg, setMsg] = useState<string | null>(null);
  const { authenticated } = useContext(AuthContext);

  async function fetchSecret() {
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/secret', { credentials: 'include' });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setMsg(data.message);
    } catch (e) {
      setMsg('Error: ' + String(e));
    }
  }

  return (
    <main className="page">
      <h1>Mini Auth Frontend</h1>
      {!authenticated && (
        <p>
          <Link href="/login">Login</Link> | <Link href="/signup">Sign Up</Link> | <Link href="/dashboard">Dashboard</Link>
        </p>
      )}
      <button className="btn" onClick={fetchSecret}>Fetch /secret</button>
      {msg && <pre className="result">{msg}</pre>}
    </main>
  );
}
