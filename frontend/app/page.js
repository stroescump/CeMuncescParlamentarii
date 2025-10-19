'use client';
import useSWR from 'swr';
import { useState, useMemo } from 'react';
import { Search, ExternalLink, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const fetcher = (url) => fetch(url).then(r => r.json());

function useDebounced(value, ms = 250) {
  const [v, setV] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function BillCard({ bill }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      {/* Main Content - Always Visible */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {/* Bill Number and Date */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 
                             text-blue-700 text-sm font-medium border border-blue-200">
                {bill.numar || 'N/A'}
              </span>
              {bill.data && (
                <span className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {bill.data}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-slate-900 mb-3 leading-tight">
              {bill.titlu || 'Untitled Bill'}
            </h2>

            {/* Status Badge */}
            {bill.stadiu && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-slate-500">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                  ${bill.stadiu.toLowerCase().includes('lege') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                  {bill.stadiu}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          {bill.link_proiect && (
            <a
              href={bill.link_proiect}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                       rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium
                       shadow-sm hover:shadow"
            >
              View Bill
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {bill.link_lege && (
            <a
              href={bill.link_lege}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                       rounded-lg hover:bg-green-700 transition-colors text-sm font-medium
                       shadow-sm hover:shadow"
            >
              View Law
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700
                     rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium ml-auto"
          >
            {expanded ? (
              <>
                Show Less
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Details
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* All Available Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {bill.index && (
                <div>
                  <span className="text-slate-500 font-medium">Index:</span>
                  <span className="ml-2 text-slate-900">{bill.index}</span>
                </div>
              )}
              {bill.numar && (
                <div>
                  <span className="text-slate-500 font-medium">Bill Number:</span>
                  <span className="ml-2 text-slate-900">{bill.numar}</span>
                </div>
              )}
              {bill.data && (
                <div>
                  <span className="text-slate-500 font-medium">Date:</span>
                  <span className="ml-2 text-slate-900">{bill.data}</span>
                </div>
              )}
              {bill.stadiu && (
                <div>
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className="ml-2 text-slate-900">{bill.stadiu}</span>
                </div>
              )}
            </div>

            {/* Full Title in Expanded View */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Full Description
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {bill.titlu || 'No description available'}
              </p>
            </div>

            {/* Links Section */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-3">Direct Links</h3>
              <div className="space-y-2">
                {bill.link_proiect && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <a
                      href={bill.link_proiect}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline truncate"
                    >
                      Bill on Camera Deputaților
                    </a>
                  </div>
                )}
                {bill.link_lege && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <a
                      href={bill.link_lege}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 hover:underline truncate"
                    >
                      Enacted Law
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default function Home() {
  const { data, error } = useSWR('/api/bills', fetcher);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 200);

  // Debug logging
  console.log('SWR data:', data);
  console.log('SWR error:', error);
  console.log('Data type:', typeof data);
  console.log('Is array?', Array.isArray(data));

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium">Failed to load bills</div>
          <p className="text-slate-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading legislative bills...</p>
        </div>
      </div>
    );
  }

  // Ensure data is an array
  const bills = Array.isArray(data) ? data : [];

  const filtered = bills.filter(p => {
    if (!debouncedQuery) return true;
    const q = debouncedQuery.toLowerCase();
    return (
      (p.titlu || '').toLowerCase().includes(q) || 
      (p.numar || '').toLowerCase().includes(q) ||
      (p.stadiu || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Legislative Bills 2025
        </h1>
        <p className="text-lg text-slate-600 max-w-3xl">
          Track all legislative initiatives from Camera Deputaților. 
          Full transparency on what's being decided and voted on your behalf.
        </p>
      </div>

      {/* Search and Stats Bar */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl shadow-sm text-base
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                     transition-all bg-white"
            placeholder="Search by title, bill number, or status..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-6">
            <div className="text-sm">
              <span className="text-slate-500">Total bills:</span>
              <span className="ml-2 font-semibold text-slate-900">{bills.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-slate-500">Showing:</span>
              <span className="ml-2 font-semibold text-slate-900">{filtered.length}</span>
            </div>
          </div>
          {debouncedQuery && (
            <button
              onClick={() => setQuery('')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Bills Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No bills found</h3>
          <p className="text-slate-500">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((bill, idx) => (
            <BillCard key={bill.index || idx} bill={bill} />
          ))}
        </div>
      )}
    </main>
  );
}