import { Link } from 'react-router-dom';
export function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-10 text-center">
      <p className="text-amber-400 font-bold">404</p>
      <h1 className="mt-2 text-4xl font-bold">Case file not found</h1>
      <p className="mt-4 text-slate-300">The page may have moved or the address may be incorrect.</p>
      <Link
        className="mt-6 inline-block rounded bg-amber-500 px-5 py-3 font-bold text-slate-950 focus:outline focus:outline-2"
        to="/"
      >
        Return home
      </Link>
    </main>
  );
}
