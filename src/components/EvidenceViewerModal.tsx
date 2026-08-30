import React from 'react';
import { EvidenceItem } from '../types';
import { X, Search, FileText, Sparkles } from 'lucide-react';

interface EvidenceViewerModalProps {
  evidence: EvidenceItem | null;
  onClose: () => void;
  canInspect?: boolean;
  onInspect?: () => void;
  inspectionResult?: string;
}

export const EvidenceViewerModal: React.FC<EvidenceViewerModalProps> = ({
  evidence,
  onClose,
  canInspect = false,
  onInspect,
  inspectionResult
}) => {
  if (!evidence) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              {evidence.tag} Evidence
            </span>
            <h3 className="text-lg font-bold text-slate-100 mt-1">{evidence.name}</h3>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 text-sm leading-relaxed mb-4">
          <p>{evidence.description}</p>
        </div>

        {/* Forensic Inspection Context (Police special action or after inspection) */}
        {(inspectionResult || (evidence.inspectedDetail && inspectionResult)) && (
          <div className="p-4 bg-blue-950/40 border border-blue-500/40 rounded-xl text-blue-200 text-xs sm:text-sm mb-4">
            <div className="flex items-center gap-1.5 font-bold text-blue-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Forensic Inspection Findings</span>
            </div>
            <p>{inspectionResult || evidence.inspectedDetail}</p>
          </div>
        )}

        {canInspect && onInspect && !inspectionResult && (
          <button
            onClick={onInspect}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-950 transition-all mb-3"
          >
            <Search className="w-4 h-4" />
            Inspect Item with Police Authority
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
        >
          Close Review
        </button>
      </div>
    </div>
  );
};
