import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { LEGAL_PAGES } from '../content/legal';
import { Shield, FileText, Lock, AlertCircle, Award } from 'lucide-react';

export const LegalView: React.FC = () => {
  const { page } = useParams<{ page: string }>();

  const getPageData = () => {
    switch (page) {
      case 'terms':
        return LEGAL_PAGES.termsOfUse;
      case 'refunds':
        return LEGAL_PAGES.refundPolicy;
      case 'safety':
        return LEGAL_PAGES.communitySafety;
      case 'credits':
        return LEGAL_PAGES.credits;
      case 'privacy':
      default:
        return LEGAL_PAGES.privacyPolicy;
    }
  };

  const data = getPageData();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      {/* Navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
        <Link
          to="/legal/privacy"
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            page === 'privacy' || !page
              ? 'bg-amber-500 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Privacy Policy
        </Link>
        <Link
          to="/legal/terms"
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            page === 'terms' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Terms of Use
        </Link>
        <Link
          to="/legal/refunds"
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            page === 'refunds' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Refunds & Host Passes
        </Link>
        <Link
          to="/legal/safety"
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            page === 'safety' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Community Safety
        </Link>
        <Link
          to="/legal/credits"
          className={`px-3 py-1.5 rounded-xl transition-colors ${
            page === 'credits' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Credits & Audio
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl">
        <div className="space-y-1">
          <span className="text-xs uppercase font-mono text-amber-400">Legal & Transparency</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">{data.title}</h1>
          <p className="text-xs text-slate-500">Last updated: {data.lastUpdated}</p>
        </div>

        <div className="space-y-6 divide-y divide-slate-800/80 pt-2">
          {data.sections.map((sec, idx) => (
            <div key={idx} className="pt-4 first:pt-0 space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-200">{sec.heading}</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{sec.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
