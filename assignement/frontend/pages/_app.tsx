import '../styles.css';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { createContext, useEffect, useState } from 'react';

type AuthContextType = {
  authenticated: boolean;
  userName?: string | null;
  setAuthenticated: (v: boolean) => void;
  setUserName: (n?: string | null) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  userName: null,
  setAuthenticated: () => {},
  setUserName: () => {},
  logout: async () => {},
});

function Header({ authenticated, userName, logout }: { authenticated: boolean; userName?: string | null; logout: () => void }) {
  return (
    <header className="site-header">
      <div className="container">
        <div className="brand"><Link href="/">Mini Auth</Link></div>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          {!authenticated && <Link href="/login">Login</Link>}
          {!authenticated && <Link href="/signup">Sign Up</Link>}
          {authenticated && <button className="btn-ghost" onClick={logout}>Logout ({userName || 'me'})</button>}
        </nav>
      </div>
    </header>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function probe() {
      try {
        const url = (process.env.NEXT_PUBLIC_API_URL || '') + '/secret';
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) {
          setAuthenticated(false);
          setUserName(null);
          return;
        }
        const data = await res.json();
        setAuthenticated(true);
        const m = data?.message;
        const match = typeof m === 'string' ? m.match(/for (.+)$/) : null;
        setUserName(match ? match[1] : null);
      } catch {
        setAuthenticated(false);
        setUserName(null);
      }
    }
    probe();
  }, []);

  async function logout() {
    try {
      const url = (process.env.NEXT_PUBLIC_API_URL || '') + '/auth/logout';
      await fetch(url, { method: 'POST', credentials: 'include' });
    } catch {}
    setAuthenticated(false);
    setUserName(null);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider value={{ authenticated, userName, setAuthenticated, setUserName, logout }}>
      <Header authenticated={authenticated} userName={userName} logout={logout} />
      <Component {...pageProps} />
    </AuthContext.Provider>
  );
}
