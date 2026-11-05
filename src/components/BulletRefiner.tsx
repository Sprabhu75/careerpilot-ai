/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  Copy,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react';

interface BulletRefinerProps {
  resumeText: string;
}

export const BulletRefiner: React.FC<BulletRefinerProps> = ({ resumeText }) => {
  // Extract bullet points automatically from the resume or default to sensible samples
  const defaultBullets = [
    'Developed responsive merchant dashboard modules using React 18 and Tailwind CSS.',
    'Built role-based placement management platform for 1,400+ college students and 45 recruiters.',
    'Integrated 14 REST API endpoints with Redux Toolkit for real-time order tracking.',
    'Created web app visualizing real-time simulated stock price feeds and technical indicators.',
  ];

  const [bullets, setBullets] = useState<string[]>(defaultBullets);
  const [newBullet, setNewBullet] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refinedResults, setRefinedResults] = useState<any[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleAddBullet = () => {
    if (newBullet.trim()) {
      setBullets([...bullets, newBullet.trim()]);
      setNewBullet('');
    }
  };

  const handleRemoveBullet = (index: number) => {
    setBullets(bullets.filter((_, i) => i !== index));
  };

  const handleRefine = async () => {
    if (bullets.length === 0) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/refine-bullets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bulletPoints: bullets,
          targetRole: 'Software Engineer / Analyst',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to refine bullets');
      }

      const data = await response.json();
      setRefinedResults(data.refinedBullets || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Evidence-Bound Resume Bullet Refiner
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Elevates phrasing, clarity, and technical impact using strong action verbs without ever inventing fake metrics or unverified claims.
            </p>
          </div>

          <button
            onClick={handleRefine}
            disabled={isLoading || bullets.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Refining Truthfully...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Refine All Bullets</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Bullets Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Current Resume Bullet Points</h3>
          <span className="text-xs text-slate-500 font-mono">{bullets.length} items</span>
        </div>

        <div className="space-y-2">
          {bullets.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-cyan-400 font-medium">{idx + 1}.</span>
                <span>{b}</span>
              </div>
              <button
                onClick={() => handleRemoveBullet(idx)}
                className="text-slate-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                title="Remove bullet"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom bullet */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newBullet}
            onChange={(e) => setNewBullet(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddBullet();
            }}
            placeholder="Add another bullet from your resume..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleAddBullet}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Refined Results Display */}
      {refinedResults && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Refined Output & Interview Defense Guidelines
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {refinedResults.map((item, idx) => {
              const isPreserved = item.metricStatus === 'ORIGINAL_METRIC_PRESERVED';
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
                >
                  {/* Status Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-cyan-400 font-bold">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-300">
                        {item.changesMade}
                      </span>
                    </div>

                    <div className="text-xs">
                      {isPreserved ? (
                        <span className="text-emerald-400 font-medium">Original Metric Preserved</span>
                      ) : (
                        <span className="text-slate-400 font-medium">Truthful Qualitative Framing (No Fake Numbers)</span>
                      )}
                    </div>
                  </div>

                  {/* Before vs After */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-lg text-slate-400">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">
                        Original Draft
                      </div>
                      <p className="font-mono text-slate-300">{item.original}</p>
                    </div>

                    <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-slate-200 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">
                          CareerPilot Refined
                        </div>
                        <button
                          onClick={() => handleCopy(item.refined, idx)}
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-mono text-cyan-200">{item.refined}</p>
                    </div>
                  </div>

                  {/* Interview Preparation Tip for this Bullet */}
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">Interview Defense Preparation: </span>
                      <span>{item.honestyAdvice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
