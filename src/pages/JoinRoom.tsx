import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { multiplayer } from '../services/roomService';
export function JoinRoom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { alias } = useAuth();
  const code = (params.get('join') ?? '').trim().toUpperCase();
  const [error, setError] = useState('');
  const valid = /^[A-HJ-NP-Z2-9]{6}$/.test(code);
  async function join() {
    setError('');
    try {
      const result = await multiplayer.join(alias, code);
      navigate(`/lobby/${result.data.roomId}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to join this room.');
    }
  }
  return (
    <main className="mx-auto max-w-lg p-8">
      <h1 className="text-3xl font-bold">Join private room</h1>
      <p className="mt-4">
        You were invited to room <strong>{valid ? code : 'Invalid code'}</strong>. Your role and clues are
        never included in invitation links.
      </p>
      {error && (
        <p role="alert" className="mt-4 text-red-300">
          {error}
        </p>
      )}
      <div className="mt-6 flex gap-3">
        <button
          disabled={!valid}
          onClick={join}
          className="rounded bg-amber-500 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
        >
          Confirm and join
        </button>
        <button onClick={() => navigate('/')} className="rounded border px-5 py-3">
          Cancel
        </button>
      </div>
    </main>
  );
}
