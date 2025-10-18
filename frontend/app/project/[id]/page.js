'use client';
import { useEffect, useState } from 'react';

export default function ProjectPage({ params }) {
  const { id } = params;
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetch(`/api/proxy/projects/${id}`).then(r => r.json()).then(setProject);
  }, [id]);

  if (!project) return <div className="p-8">Loading…</div>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <a href="/" className="text-sm text-accent hover:underline">← Back</a>

      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-semibold">{project.title}</h1>
        <p className="text-sm text-slate-600 mt-1">{project.shortHeadline || 'No short headline available'}</p>
      </header>

      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded border border-gray-200">
          <h3 className="font-medium mb-2">Summary</h3>
          <article className="prose max-w-none">
            <p>{project.fullSummary || '—'}</p>
            {/* If you have full HTML/clauses, render here with dangerouslySetInnerHTML
                but sanitize first or render text into <p/>s */}
          </article>

          <h4 className="mt-4 font-medium">Files</h4>
          <ul className="mt-2 space-y-2 text-sm">
            {project.files.map((f, i) => (
              <li key={i}>
                <a className="text-accent hover:underline" href={f.url} target="_blank" rel="noreferrer">{f.url}</a>
              </li>
            ))}
          </ul>
        </div>

        <aside className="bg-white p-4 rounded border border-gray-200">
          <h4 className="font-medium mb-2">Votes</h4>
          <div className="text-sm text-slate-700">
            {project.votes.length === 0 && <div className="text-slate-500">No votes recorded</div>}
            <ul className="space-y-1">
              {project.votes.map((v, i) => (
                <li key={i} className="flex justify-between">
                  <span>{v.deputyName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${v.vote === 'for' ? 'bg-green-100 text-green-800' : v.vote === 'against' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {v.vote}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}