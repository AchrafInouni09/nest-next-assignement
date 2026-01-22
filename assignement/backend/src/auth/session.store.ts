type Session = { token: string; email: string; name?: string };
type User = { email: string; name?: string; password: string };

const store = new Map<string, Session>();
const users = new Map<string, User>();

export function createUser(email: string, name: string | undefined, password: string) {
  if (users.has(email)) return false;
  users.set(email, { email, name, password });
  return true;
}

export function verifyUser(email: string, password: string) {
  const u = users.get(email);
  if (!u) return null;
  return u.password === password ? u : null;
}

export function createSession(email: string, name?: string) {
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  store.set(token, { token, email, name });
  return token;
}

export function getSession(token: string | undefined) {
  if (!token) return null;
  return store.get(token) || null;
}

export function deleteSession(token: string | undefined) {
  if (!token) return;
  store.delete(token);
}
