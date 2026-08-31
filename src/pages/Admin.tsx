import { useEffect, useState } from 'react';
import type { DocumentData } from 'firebase/firestore';
import { useAuth } from '../features/auth/AuthContext';
import { SEED_CASES } from '../content/cases';
import { validateCase } from '../content/caseValidator';
import { adminService } from '../services/adminService';
import type { Case, Role } from '../types';

type RecordItem = { id: string; data: DocumentData };
const roles: Role[] = ['CHOR', 'POLICE', 'INFORMER', 'PROTECTOR', 'CITIZEN'];
export function Admin() {
  const { isAdmin } = useAuth();
  const [cases, setCases] = useState<RecordItem[]>([]);
  const [reports, setReports] = useState<RecordItem[]>([]);
  const [stats, setStats] = useState<RecordItem[]>([]);
  const [payments, setPayments] = useState<RecordItem[]>([]);
  const [config, setConfig] = useState<RecordItem[]>([]);
  const [draft, setDraft] = useState(() => JSON.stringify(SEED_CASES[0], null, 2));
  const [previewRole, setPreviewRole] = useState<Role>('CHOR');
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!isAdmin) return;
    const stops = [
      adminService.subscribeCases(setCases),
      adminService.subscribeReports(setReports),
      adminService.subscribeStats(setStats),
      adminService.subscribePayments(setPayments),
      adminService.subscribeConfig(setConfig),
    ];
    return () => stops.forEach((stop) => stop());
  }, [isAdmin]);
  if (!isAdmin)
    return (
      <main className="mx-auto max-w-xl p-10">
        <h1 className="text-3xl font-bold">Access denied</h1>
        <p className="mt-3">An administrator custom claim is required.</p>
      </main>
    );
  let parsed: unknown;
  try {
    parsed = JSON.parse(draft);
  } catch {
    parsed = null;
  }
  const validation = validateCase(parsed);
  const preview = validation.caseData;
  async function publish() {
    if (!validation.caseData) return;
    try {
      await adminService.publishCase(validation.caseData);
      setMessage('Case validated and published.');
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : 'Publish failed.');
    }
  }
  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 p-6">
      <h1 className="text-4xl font-black">Operations</h1>
      <p role="status">{message}</p>
      <section>
        <h2 className="text-2xl font-bold">Cases</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <ul className="max-h-64 overflow-auto rounded border">
              {cases.map((item) => (
                <li key={item.id} className="flex justify-between border-b p-2">
                  <button onClick={() => setDraft(JSON.stringify({ id: item.id, ...item.data }, null, 2))}>
                    {String(item.data.title ?? item.id)}
                  </button>
                  <button onClick={() => adminService.disableCase(item.id)} className="text-red-300">
                    Disable
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                setDraft(
                  JSON.stringify({ ...SEED_CASES[0], id: `case-${Date.now()}`, title: 'New case' }, null, 2),
                )
              }
              className="mt-2 rounded border px-3 py-2"
            >
              Create case
            </button>
          </div>
          <div>
            <label className="font-bold" htmlFor="case-json">
              Case editor
            </label>
            <textarea
              id="case-json"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="mt-2 h-80 w-full rounded bg-slate-900 p-3 font-mono text-xs"
            />
            <ul className="text-red-300">
              {validation.errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
            <button
              disabled={!validation.valid}
              onClick={publish}
              className="mt-2 rounded bg-amber-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
            >
              Validate and publish
            </button>
          </div>
        </div>
        {preview && (
          <div className="mt-4 rounded border p-4">
            <label>
              Preview role{' '}
              <select
                value={previewRole}
                onChange={(event) => setPreviewRole(event.target.value as Role)}
                className="bg-slate-900"
              >
                {roles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <h3 className="mt-2 font-bold">{preview.title}</h3>
            <p>{preview.intro}</p>
            <p className="mt-2 text-amber-300">
              {previewRole === 'CHOR'
                ? preview.roleClues.chorCoverClue
                : previewRole === 'POLICE'
                  ? preview.roleClues.policeVerifiedClue
                  : previewRole === 'INFORMER'
                    ? preview.roleClues.informerSecretClue
                    : previewRole === 'PROTECTOR'
                      ? preview.roleClues.protectorDefenseClue
                      : preview.roleClues.citizenClues[0]}
            </p>
          </div>
        )}
      </section>
      <DataSection title="Reports" items={reports} />
      <DataSection title="Anonymised match statistics" items={stats} />
      <DataSection
        title="Payment status (non-sensitive)"
        items={payments}
        fields={['status', 'amount', 'currency', 'createdAt']}
      />
      <section>
        <h2 className="text-2xl font-bold">Timing and maintenance</h2>
        <p className="text-sm text-slate-400">Current records: {config.length}</p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => adminService.updateConfig(true, { INVESTIGATION: 90, FINAL_VOTING: 30 })}
            className="rounded border border-red-500 px-3 py-2"
          >
            Enable maintenance
          </button>
          <button
            onClick={() => adminService.updateConfig(false, { INVESTIGATION: 90, FINAL_VOTING: 30 })}
            className="rounded border px-3 py-2"
          >
            Save timings and disable maintenance
          </button>
        </div>
      </section>
    </main>
  );
}
function DataSection({ title, items, fields }: { title: string; items: RecordItem[]; fields?: string[] }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="mt-3 max-h-72 overflow-auto rounded border border-slate-700">
        {items.length ? (
          items.map((item) => (
            <li key={item.id} className="border-b p-3">
              <strong>{item.id}</strong>
              <pre className="mt-1 overflow-auto text-xs text-slate-300">
                {JSON.stringify(
                  fields ? Object.fromEntries(fields.map((field) => [field, item.data[field]])) : item.data,
                  null,
                  2,
                )}
              </pre>
            </li>
          ))
        ) : (
          <li className="p-3 text-slate-400">No records.</li>
        )}
      </ul>
    </section>
  );
}
