import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { multiplayer } from '../services/roomService';

export function Home() {
  const { alias, uid } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const invited = params.get('join')?.trim().toUpperCase();
    if (invited) navigate(`/join?join=${encodeURIComponent(invited)}`, { replace: true });
  }, [navigate, params]);

  async function perform(operation: () => Promise<{ data: { roomId: string } }>) {
    setBusy(true);
    setError('');
    try {
      const response = await operation();
      navigate(`/lobby/${response.data.roomId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The request could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-10 px-5 py-12">
      <header className="text-center">
        <p className="font-bold uppercase tracking-[0.3em] text-amber-400">Six-player social deduction</p>
        <h1 className="mt-4 text-5xl font-black sm:text-7xl">Chor Police: Bluff Royale</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
          Investigate a case, protect an ally, expose the Chor—or bluff your way to freedom. Bots are always
          visibly labelled and follow deterministic game rules.
        </p>
      </header>
      {error && (
        <p role="alert" className="rounded border border-red-500 bg-red-950 p-3 text-red-100">
          {error}
        </p>
      )}
      <section className="grid gap-5 md:grid-cols-2" aria-label="Play options">
        <button
          disabled={busy || !uid}
          onClick={() => perform(() => multiplayer.quickMatch(alias))}
          className="rounded-2xl bg-amber-500 p-8 text-left text-slate-950 shadow-lg focus:outline focus:outline-2 focus:outline-offset-4 disabled:opacity-50"
        >
          <span className="block text-2xl font-black">Quick Match</span>
          <span>Free public matchmaking waits for humans, then fills open seats with labelled bots.</span>
        </button>
        <button
          disabled={busy || !uid}
          onClick={() => perform(() => multiplayer.createPrivate(alias, 'FILL_WITH_BOTS'))}
          className="rounded-2xl border border-sky-400 bg-slate-900 p-8 text-left focus:outline focus:outline-2 focus:outline-offset-4 disabled:opacity-50"
        >
          <span className="block text-2xl font-black text-sky-300">Create Private Room</span>
          <span className="text-slate-300">Invite friends and choose how remaining seats are handled.</span>
        </button>
      </section>
      <form
        className="mx-auto flex w-full max-w-lg gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (/^[A-Z0-9]{6}$/.test(code)) navigate(`/join?join=${code}`);
        }}
      >
        <label className="sr-only" htmlFor="room-code">
          Six-character room code
        </label>
        <input
          id="room-code"
          value={code}
          onChange={(event) =>
            setCode(
              event.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 6),
            )
          }
          placeholder="ROOM CODE"
          className="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-4 py-3 font-mono uppercase tracking-widest"
        />
        <button
          disabled={code.length !== 6 || busy}
          className="rounded bg-sky-500 px-5 font-bold text-slate-950 disabled:opacity-50"
        >
          Review invite
        </button>
      </form>
    </div>
  );
}
