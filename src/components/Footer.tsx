import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, AlertCircle, Heart, LifeBuoy } from 'lucide-react';
import { ReportModal } from './ReportModal';

export const Footer: React.FC = () => {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 py-8 px-4 sm:px-6 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-300">Chor Police: Bluff Royale</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Pure Recreational Social Deduction</span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400">
          <Link to="/legal/privacy" className="hover:text-amber-400 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/legal/terms" className="hover:text-amber-400 transition-colors">
            Terms of Use
          </Link>
          <Link to="/legal/refunds" className="hover:text-amber-400 transition-colors">
            Refunds & Passes
          </Link>
          <Link to="/legal/safety" className="hover:text-amber-400 transition-colors">
            Community Safety
          </Link>
          <Link to="/legal/credits" className="hover:text-amber-400 transition-colors">
            Credits
          </Link>
          <button
            onClick={() => setReportOpen(true)}
            className="hover:text-red-400 flex items-center gap-1 transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Report Issue
          </button>
        </div>

        {/* Right disclaimer */}
        <div className="text-slate-500 text-[11px] text-center md:text-right">
          <p>No real-money gambling. All cases fictional.</p>
          <p className="text-[10px] text-slate-600">Local storage maintains anonymous progress.</p>
        </div>
      </div>

      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </footer>
  );
};
