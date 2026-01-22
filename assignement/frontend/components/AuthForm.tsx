import React from 'react';

type Props = {
  name?: string;
  email: string;
  password: string;
  setName?: (v: string) => void;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
};

export default function AuthForm({ name, email, password, setName, setEmail, setPassword, onSubmit, submitLabel = 'Submit' }: Props) {
  return (
    <form className="auth-form" onSubmit={onSubmit}>
      {typeof setName === 'function' && (
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={name || ''} onChange={(e) => setName(e.target.value)} required />
        </div>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button className="btn" type="submit">{submitLabel}</button>
    </form>
  );
}
