import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import {
  multiplayer,
  subscribeToPrivateState,
  subscribeToRoom,
  type RoomView,
} from '../services/roomService';
import type { PrivatePlayerState, StructuredActionType } from '../types';

function PhaseHeader({ room, seconds }: { room: RoomView; seconds: number }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700 bg-slate-950/95 p-4">
      <div>
        <p className="text-xs text-amber-400">ROUND {room.round ?? 1}</p>
        <h1 className="text-xl font-black">{room.currentPhase?.replaceAll('_', ' ')}</h1>
      </div>
      <p role="timer" aria-live="polite" className="font-mono text-2xl">
        {seconds}s
      </p>
    </header>
  );
}
function Seats({ room }: { room: RoomView }) {
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {room.members.map((member) => (
        <li key={member.uid} className="rounded border border-slate-700 p-3">
          <strong>
            Seat {member.seatIndex + 1}: {member.alias}
          </strong>
          {member.isBot && <span className="ml-2 rounded bg-sky-800 px-2 text-xs">BOT</span>}
        </li>
      ))}
    </ol>
  );
}

export function GameMatch() {
  const { roomId = '' } = useParams();
  const { uid } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomView | null>(null);
  const [secret, setSecret] = useState<PrivatePlayerState | null>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());
  const [target, setTarget] = useState<number | null>(null);
  const [content, setContent] = useState('');
  useEffect(() => subscribeToRoom(roomId, uid, setRoom, (reason) => setError(reason.message)), [roomId, uid]);
  useEffect(
    () => subscribeToPrivateState(roomId, uid, setSecret, (reason) => setError(reason.message)),
    [roomId, uid],
  );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);
  const seconds = useMemo(
    () => Math.max(0, Math.ceil(((room?.phaseEndsAt?.toMillis() ?? now) - now) / 1000)),
    [now, room],
  );
  useEffect(() => {
    if (!room?.currentPhase || seconds > 0 || room.status !== 'IN_GAME') return;
    const timer = setTimeout(
      () =>
        multiplayer.advance(room.id, room.currentPhase!, room.phaseVersion).catch((reason) => {
          const code = (reason as { code?: string }).code ?? '';
          if (!code.includes('aborted'))
            setError(reason instanceof Error ? reason.message : 'Phase synchronization failed.');
        }),
      250,
    );
    return () => clearTimeout(timer);
  }, [room, seconds]);
  async function invoke(action: () => Promise<unknown>) {
    setError('');
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Action failed.');
    }
  }
  if (!room)
    return (
      <main role="status" className="grid flex-1 place-items-center">
        Reconnecting to the match…
      </main>
    );
  const me = room.members.find((member) => member.uid === uid);
  const targets = room.members.filter((member) => member.uid !== uid);
  const visibleActions = room.actions.filter(
    (action) => !action.publishAt || action.publishAt.toMillis() <= now,
  );
  return (
    <main className="mx-auto w-full max-w-6xl pb-12">
      <PhaseHeader room={room} seconds={seconds} />
      <div className="space-y-7 p-5" aria-live="polite">
        {error && (
          <p role="alert" className="rounded border border-red-500 p-3 text-red-200">
            {error}
          </p>
        )}
        <Seats room={room} />
        {room.currentPhase === 'CASE_INTRO' && (
          <section>
            <h2 className="text-2xl font-bold">Case briefing</h2>
            <p className="mt-2 text-slate-300">
              Case file {Number(room.caseIndex ?? 0) + 1} is being distributed. Review only public evidence
              until your secret role appears.
            </p>
          </section>
        )}
        {room.currentPhase === 'SECRET_ROLE' && (
          <section className="rounded-xl border border-amber-500 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Your secret role</h2>
            {secret ? (
              <>
                <p className="mt-3 text-3xl font-black text-amber-400">{secret.role}</p>
                <p>{secret.objective}</p>
                <p className="mt-2 text-slate-300">{secret.privateClue}</p>
              </>
            ) : (
              <p>Waiting for your private role document…</p>
            )}
          </section>
        )}
        {room.currentPhase === 'EVIDENCE_REVIEW' && (
          <section>
            <h2 className="text-2xl font-bold">Evidence review</h2>
            <p>Discuss only information your role is permitted to know.</p>
          </section>
        )}
        {room.currentPhase === 'INVESTIGATION' && (
          <section>
            <h2 className="text-2xl font-bold">Investigation</h2>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!content.trim()) return;
                void invoke(async () => {
                  await multiplayer.action(
                    room.id,
                    'STATEMENT' as StructuredActionType,
                    content.trim(),
                    target ?? undefined,
                  );
                  setContent('');
                });
              }}
            >
              <input
                aria-label="Structured statement"
                value={content}
                onChange={(event) => setContent(event.target.value.slice(0, 300))}
                className="min-w-0 flex-1 rounded bg-slate-900 px-3"
              />
              <button className="rounded bg-sky-500 px-4 py-2 font-bold text-slate-950">
                Submit statement
              </button>
            </form>
            <ul className="mt-4 space-y-2">
              {visibleActions.map((action) => (
                <li key={action.id} className="rounded border border-slate-700 p-2">
                  Seat {action.actorSeatIndex + 1}: {action.content}
                </li>
              ))}
            </ul>
          </section>
        )}
        {room.currentPhase === 'SPECIAL_ACTIONS' && (
          <section>
            <h2 className="text-2xl font-bold">Special action</h2>
            <TargetPicker targets={targets} value={target} setValue={setTarget} />
            {secret && ['POLICE', 'PROTECTOR', 'INFORMER', 'CHOR'].includes(secret.role) && (
              <button
                disabled={target === null}
                onClick={() =>
                  invoke(() =>
                    multiplayer.special(
                      room.id,
                      (
                        {
                          POLICE: 'SPECIAL_INSPECT',
                          PROTECTOR: 'SPECIAL_PROTECT',
                          INFORMER: 'SPECIAL_INFORM',
                          CHOR: 'SPECIAL_PLANT_DOUBT',
                        } as Record<string, string>
                      )[secret.role],
                      target!,
                    ),
                  )
                }
                className="mt-3 rounded bg-amber-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
              >
                Submit role action
              </button>
            )}
          </section>
        )}
        {room.currentPhase === 'FINAL_VOTING' && (
          <section>
            <h2 className="text-2xl font-bold">Final vote</h2>
            <TargetPicker targets={targets} value={target} setValue={setTarget} />
            <button
              disabled={target === null}
              onClick={() => invoke(() => multiplayer.vote(room.id, target!))}
              className="mt-3 rounded bg-amber-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
            >
              Lock vote
            </button>
            <p className="mt-2 text-sm text-slate-400">
              Missing votes become abstentions when the server deadline expires.
            </p>
          </section>
        )}
        {room.currentPhase === 'TIE_BREAK' && (
          <section>
            <h2 className="text-2xl font-bold">Police tie-break</h2>
            {room.policeUid === uid ? (
              <>
                <TargetPicker
                  targets={targets.filter((member) => room.tiedSeatIndices?.includes(member.seatIndex))}
                  value={target}
                  setValue={setTarget}
                />
                <button
                  disabled={target === null}
                  onClick={() => invoke(() => multiplayer.resolveTie(room.id, target!, room.phaseVersion))}
                  className="mt-3 rounded bg-amber-500 px-4 py-2 font-bold text-slate-950"
                >
                  Resolve tie
                </button>
              </>
            ) : (
              <p>The Police player is deciding. The server applies a deterministic fallback at timeout.</p>
            )}
          </section>
        )}
        {(room.currentPhase === 'REVEAL' || room.status === 'FINISHED') && room.result && (
          <section>
            <h2 className="text-3xl font-black">
              {room.result.winningTeam === 'POLICE_SIDE' ? 'Investigators win' : 'The Chor escapes'}
            </h2>
            <p className="mt-2">The Chor occupied seat {room.result.chorSeatIndex + 1}.</p>
            <ul className="mt-4">
              {room.result.allRoles.map((line) => (
                <li key={line.seatIndex}>
                  Seat {line.seatIndex + 1}: {line.role} — {line.points} points
                </li>
              ))}
            </ul>
            <button
              onClick={() => invoke(() => multiplayer.rematch(room.id))}
              className="mt-5 rounded bg-amber-500 px-4 py-2 font-bold text-slate-950"
            >
              Request rematch
            </button>
            <button onClick={() => navigate('/')} className="ml-3 rounded border px-4 py-2">
              Home
            </button>
          </section>
        )}
        <p className="text-xs text-slate-500">
          You are seat {(me?.seatIndex ?? 0) + 1}. Timers and outcomes are controlled by the server.
        </p>
      </div>
    </main>
  );
}

function TargetPicker({
  targets,
  value,
  setValue,
}: {
  targets: RoomView['members'];
  value: number | null;
  setValue(value: number): void;
}) {
  return (
    <fieldset className="mt-3">
      <legend className="sr-only">Select a target seat</legend>
      <div className="flex flex-wrap gap-2">
        {targets.map((member) => (
          <label key={member.uid} className="rounded border border-slate-600 p-2">
            <input
              type="radio"
              name="target-seat"
              checked={value === member.seatIndex}
              onChange={() => setValue(member.seatIndex)}
            />{' '}
            Seat {member.seatIndex + 1} {member.alias}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
