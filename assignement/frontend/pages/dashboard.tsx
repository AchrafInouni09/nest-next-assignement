import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { AuthContext } from './_app';

export default function Dashboard() {
  const { authenticated, userName } = useContext(AuthContext);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSecret() {
      setLoading(true);
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || '') + '/secret', { credentials: 'include' });
        if (!res.ok) throw new Error('Unauthorized');
        const data = await res.json();
        setMessage(data.message);
      } catch {
        setMessage('Could not fetch secret');
      } finally {
        setLoading(false);
      }
    }
    fetchSecret();
  }, []);

  return (
    <main className="page">
      <h1>Dashboard</h1>
      <p>Signed in: <strong>{authenticated ? userName ?? 'you' : 'no'}</strong></p>
      <div className="card">
        <h3>Protected Message</h3>
        <div className="secret">{loading ? 'Loading...' : message}</div>
      </div>
      <p style={{ marginTop: 16 }}><Link href="/">Home</Link></p>
    </main>
  );
}