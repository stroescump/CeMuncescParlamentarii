'use client';
import useSWR from 'swr';
import { useState, useMemo } from 'react';

const fetcher = (url) => fetch(url).then(r => r.json());

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Home() {
  const { data, error } = useSWR('/api/proxy/projects', fetcher);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 200);

  if (error) return <div className="p-8 text-red-600">Failed to load</div>;
  if (!data) return <div className="p-8">Loading…</div>;

  const filtered = data.filter(p => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (p.title || '').toLowerCase().includes(q) || (p.shortHeadline || '').toLowerCase().includes(q);
  });

  return (
    <main className="max-w-5xl mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Legislative projects</h1>
          <div className="ml-auto">
            <input
              className="px-3 py-2 border border-gray-200 rounded-md shadow-sm w-64 focus:ring-2 focus:ring-accent focus:outline-none"
              placeholder="Search title or summary..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">Showing {filtered.length} of {data.length}</p>
      </header>

      <div className="grid gap-4">
        {filtered.map((p) => (
          <a key={p.id} href={`/project/${p.id}`} className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-medium text-slate-900">{p.title}</div>
                <div className="text-sm text-slate-600 mt-1">{p.shortHeadline || '—'}</div>
              </div>
              <div className="text-xs text-slate-500">{new Date(p.updatedAt).toLocaleDateString()}</div>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}