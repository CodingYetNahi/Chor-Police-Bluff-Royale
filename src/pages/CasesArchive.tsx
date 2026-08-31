import React, { useState } from 'react';
import { SEED_CASES } from '../content/cases';
import { Case } from '../types';
import { Search, MapPin, AlertCircle, FileText, ChevronRight, X } from 'lucide-react';

export const CasesArchive: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const filteredCases = SEED_CASES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.summary || c.intro).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-mono text-amber-400">Case Dossiers</span>
        <h1 className="text-3xl font-black text-slate-100">Official Cases Archive</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Explore all 20 deduction scenarios, crime locations, forensic stakes, and evidence dossiers.
        </p>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by case title, location, or keyword..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Grid of Cases */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedCase(c)}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl p-5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                  {c.id.replace('case_', 'CASE #')}
                </span>
                <span className="text-slate-500">{c.category || 'Investigation'}</span>
              </div>

              <h2 className="text-base font-bold text-slate-100 leading-tight">{c.title}</h2>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{c.summary || c.intro}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1 truncate max-w-[180px]">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{c.location}</span>
              </span>

              <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                View Dossier <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setSelectedCase(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono text-amber-400">
                {selectedCase.id.replace('case_', 'Case Dossier #')} • {selectedCase.location}
              </span>
              <h2 className="text-2xl font-black text-slate-100">{selectedCase.title}</h2>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>{selectedCase.summary || selectedCase.intro}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase text-amber-400">Incident Timeline</h3>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {(
                    selectedCase.timeline || [
                      { time: '14:00', event: 'Event opens to guests' },
                      { time: '14:15', event: 'Primary incident occurs' },
                      { time: '14:20', event: 'Alarm raised by staff' },
                      { time: '14:30', event: 'Area locked down for investigation' },
                    ]
                  ).map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-mono text-amber-400 font-bold">{t.time}</span>
                      <span>{t.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h3 className="text-xs font-bold uppercase text-amber-400">Stakes & Motive</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedCase.stakes ||
                    'High stakes forensic investigation with multiple conflicting alibis.'}
                </p>
                <div className="pt-2 text-xs text-slate-400">
                  <strong>Contradiction Anchor:</strong> Public timeline data directly clashes with false
                  witness claims.
                </div>
              </div>
            </div>

            {/* Evidence items */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-300 mb-2">
                Registered Physical Evidence (4 Items)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedCase.publicEvidence.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs">
                    <span className="font-mono uppercase text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {ev.tag}
                    </span>
                    <p className="font-bold text-slate-200 mt-1">{ev.name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{ev.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedCase(null)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
