/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const RulesBanner: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">CareerPilot AI Operating Principles:</span>
          <span className="text-slate-400 hidden lg:inline">
            Designed for students, freshers & early-career professionals across India
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>Strict Evidence Grounding (No Invented Skills)</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Verbatim Snippets &lt;20 words</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">·</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Estimated Match (No ATS Score Myths)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
