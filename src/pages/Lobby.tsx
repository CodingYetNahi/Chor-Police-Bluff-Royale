import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { multiplayer, subscribeToRoom, type RoomView } from '../services/roomService';
import type { RoomPolicy } from '../types';

export function Lobby() {
  const { roomId = '' } = useParams();
  const { uid, alias } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomView | null>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => subscribeToRoom(roomId, uid, setRoom, (reason) => setError(reason.message)), [roomId, uid]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (room?.status === 'IN_GAME' || room?.status === 'FINISHED')
      navigate(`/match/${room.id}`, { replace: true });
  }, [navigate, room]);

  const me = room?.members.find((member) => member.uid === uid);
  const isHost = room?.hostUid === uid;
  const deadline = useMemo(
    () => (room?.isPrivate ? room.botFillAt?.toMillis() : room?.humanDeadline?.toMillis()),
    [room],
  );
  const waitSeconds = deadline ? Math.max(0, Math.ceil((deadline - now) / 1000)) : 0;
  useEffect(() => {
    if (!room || room.status !== 'LOBBY' || waitSeconds !== 0 || room.policy === 'HUMANS_ONLY') return;
    if (room.isPrivate && !isHost) return;
    void multiplayer
      .fillBots(room.id)
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : 'Automatic seat filling failed.'),
      );
  }, [isHost, room, waitSeconds]);
  async function invoke(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Request failed.');
    }
  }

  if (!room)
    return (
      <main role="status" className="grid flex-1 place-items-center">
        Restoring your room…
      </main>
    );
  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-400">Room code</p>
          <h1 className="font-mono text-4xl font-black tracking-[0.2em]">{room.code}</h1>
        </div>
        <p aria-live="polite">{room.occupancy} of 6 seats occupied</p>
      </header>
      {error && (
        <p role="alert" className="mt-4 rounded border border-red-500 p-3 text-red-200">
          {error}
        </p>
      )}
      <ol className="mt-8 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, seat) => {
          const member = room.members.find((candidate) => candidate.seatIndex === seat);
          return (
            <li key={seat} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <span className="mr-3 text-slate-500">Seat {seat + 1}</span>
              {member ? (
                <>
                  <strong>{member.alias}</strong>
                  {member.isBot && <span className="ml-2 rounded bg-sky-800 px-2 text-xs">BOT</span>}
                  <span className="ml-2 text-xs">{member.isReady ? 'READY' : 'NOT READY'}</span>
                </>
              ) : (
                <span className="text-slate-500">Waiting…</span>
              )}
            </li>
          );
        })}
      </ol>
      {isHost && room.isPrivate && (
        <fieldset className="mt-8">
          <legend className="font-bold">Room policy</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {(['HUMANS_ONLY', 'FILL_WITH_BOTS', 'OPEN_REMAINING_SEATS'] as RoomPolicy[]).map((policy) => (
              <label key={policy} className="rounded border border-slate-700 p-3">
                <input
                  type="radio"
                  name="policy"
                  checked={room.policy === policy}
                  onChange={() => invoke(() => multiplayer.policy(room.id, policy))}
                />{' '}
                <span>{policy.replaceAll('_', ' ')}</span>
              </label>
            ))}
          </div>
          {room.policy === 'OPEN_REMAINING_SEATS' && (
            <p className="mt-2 text-amber-300">
              Invitees have 30 seconds of priority. Public players may then take open seats for 20 seconds
              before bots fill them.
            </p>
          )}
        </fieldset>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => invoke(() => multiplayer.ready(room.id, !me?.isReady))}
          className="rounded bg-sky-500 px-5 py-3 font-bold text-slate-950"
        >
          {me?.isReady ? 'Not ready' : 'Ready'}
        </button>
        {isHost && (
          <button
            onClick={() => invoke(() => multiplayer.start(room.id))}
            className="rounded bg-amber-500 px-5 py-3 font-bold text-slate-950"
          >
            Start match
          </button>
        )}
        {waitSeconds === 0 && room.policy !== 'HUMANS_ONLY' && (
          <button
            onClick={() => invoke(() => multiplayer.fillBots(room.id))}
            className="rounded border px-5 py-3"
          >
            Continue with bots
          </button>
        )}
        <button
          onClick={() => setError('You remain in this room. Your seat is reserved.')}
          className="rounded border px-5 py-3"
        >
          Keep waiting
        </button>
        {room.isPrivate && (
          <button
            onClick={() =>
              invoke(async () => {
                await multiplayer.leave(room.id);
                const result = await multiplayer.quickMatch(alias);
                navigate(`/lobby/${result.data.roomId}`, { replace: true });
              })
            }
            className="rounded border px-5 py-3"
          >
            Join public match
          </button>
        )}
        <button
          onClick={() =>
            invoke(async () => {
              await multiplayer.leave(room.id);
              navigate('/');
            })
          }
          className="rounded border border-red-500 px-5 py-3 text-red-200"
        >
          Leave room
        </button>
      </div>
      {waitSeconds > 0 && (
        <p aria-live="polite" className="mt-4 text-slate-300">
          Human joining window: {waitSeconds}s remaining
        </p>
      )}
    </main>
  );
}
