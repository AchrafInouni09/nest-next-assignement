import { useRouter } from 'next/router';
import { useState, useContext, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import { AuthContext } from './_app';

export default function Signup() {
  const router = useRouter();
  const { setAuthenticated, setUserName, authenticated } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authenticated) router.replace('/dashboard');
  }, [authenticated, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const url = (process.env.NEXT_PUBLIC_API_URL || '') + '/auth/signup';
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || 'Sign up failed');
      }
      setAuthenticated(true);
      setUserName(name || email);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Error');
    }
  }

  return (
    <main className="page">
      <h1>Sign Up</h1>
      {error && <div className="alert">{error}</div>}
      <AuthForm name={name} email={email} password={password} setName={setName} setEmail={setEmail} setPassword={setPassword} onSubmit={onSubmit} submitLabel="Sign Up" />
    </main>
  );
}
