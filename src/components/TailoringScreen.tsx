/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Edit3,
  CheckCheck,
  AlertCircle,
  Copy,
  Download,
  BookOpen,
  Tag,
  HelpCircle,
  ShieldAlert,
  Save,
  RotateCcw,
} from 'lucide-react';

export interface BulletRewrite {
  original: string;
  improved: string;
  reason: string;
  needs_user_input: string | null;
}

export interface SkillToLearn {
  skill: string;
  why: string;
  free_resource_type: string;
}

export interface TailoringData {
  summary_suggestion: string;
  bullet_rewrites: BulletRewrite[];
  keywords_to_add_if_true: string[];
  skills_to_learn_first: SkillToLearn[];
}

interface TailoringScreenProps {
  data: TailoringData;
  roleTitle?: string;
  onBackToReport: () => void;
  onBackToHome: () => void;
  onProceedToInterview?: () => void;
}

type BulletStatus = 'pending' | 'accepted' | 'edited' | 'rejected';

interface BulletState {
  status: BulletStatus;
  currentText: string;
  isEditing: boolean;
}

/**
 * Highlights any [placeholder] pattern inside text with an amber badge
 */
export function renderWithHighlightedPlaceholders(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, index) => {
        if (/^\[.+\]$/.test(part)) {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 mx-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-xs text-xs animate-pulse"
              title="Candidate must confirm and supply this metric or detail"
            >
              <AlertCircle className="w-3 h-3 text-amber-400 inline shrink-0" />
              <span>{part}</span>
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

export const TailoringScreen: React.FC<TailoringScreenProps> = ({
  data,
  roleTitle = 'Target Role',
  onBackToReport,
  onBackToHome,
  onProceedToInterview,
}) => {
  // Manage state for each bullet rewrite
  const [bulletStates, setBulletStates] = useState<Record<number, BulletState>>(() => {
    const initial: Record<number, BulletState> = {};
    data.bullet_rewrites.forEach((b, idx) => {
      initial[idx] = {
        status: 'pending',
        currentText: b.improved,
        isEditing: false,
      };
    });
    return initial;
  });

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedAllAccepted, setCopiedAllAccepted] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');

  const handleStatusChange = (index: number, newStatus: BulletStatus) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        status: newStatus,
        isEditing: false,
      },
    }));
  };

  const handleStartEditing = (index: number) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        isEditing: true,
      },
    }));
  };

  const handleSaveEdit = (index: number) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        status: 'edited',
        isEditing: false,
      },
    }));
  };

  const handleCancelEdit = (index: number) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        currentText: data.bullet_rewrites[index].improved,
        isEditing: false,
      },
    }));
  };

  const handleTextChange = (index: number, val: string) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        currentText: val,
      },
    }));
  };

  const handleResetBullet = (index: number) => {
    setBulletStates((prev) => ({
      ...prev,
      [index]: {
        status: 'pending',
        currentText: data.bullet_rewrites[index].improved,
        isEditing: false,
      },
    }));
  };

  const copyToClipboard = (text: string, onDone: () => void) => {
    navigator.clipboard.writeText(text);
    onDone();
  };

  const handleCopySummary = () => {
    copyToClipboard(data.summary_suggestion, () => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    });
  };

  const handleCopyAllAccepted = () => {
    const acceptedTexts: string[] = [];
    data.bullet_rewrites.forEach((b, idx) => {
      const state = bulletStates[idx];
      if (state.status === 'accepted' || state.status === 'edited') {
        acceptedTexts.push(`• ${state.currentText}`);
      }
    });

    if (acceptedTexts.length === 0) {
      // If none accepted yet, copy all improved
      data.bullet_rewrites.forEach((b, idx) => {
        acceptedTexts.push(`• ${bulletStates[idx]?.currentText || b.improved}`);
      });
    }

    copyToClipboard(acceptedTexts.join('\n'), () => {
      setCopiedAllAccepted(true);
      setTimeout(() => setCopiedAllAccepted(false), 2000);
    });
  };

  const acceptedCount = Object.values(bulletStates).filter(
    (s) => s.status === 'accepted' || s.status === 'edited'
  ).length;
  const rejectedCount = Object.values(bulletStates).filter((s) => s.status === 'rejected').length;
  const pendingCount = Object.values(bulletStates).filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Header & Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={onBackToReport}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Match Report</span>
            </button>
            <span className="text-slate-600">·</span>
            <button
              onClick={onBackToHome}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Start Over
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            Step 3: Tailor Resume for <span className="text-teal-400">{roleTitle}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Refine resume bullets and career summary without fabricating metrics or unverified technologies.
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAllAccepted}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer"
          >
            {copiedAllAccepted ? (
              <>
                <CheckCheck className="w-4 h-4 text-slate-950" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>Copy Accepted Bullets ({acceptedCount})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Card 1: 3-Line Summary Suggestion */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Suggested 3-Line Career Summary</h2>
              <span className="text-[11px] text-teal-300">
                Crafted using ONLY verified facts and metrics found in your resume
              </span>
            </div>
          </div>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-teal-500/50 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-teal-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-line border-l-4 border-l-teal-500">
          {data.summary_suggestion}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            CareerPilot Rule: Never invents accolades or titles. Place this at the top of your resume beneath contact details.
          </span>
        </div>
      </div>

      {/* Bullet Rewrites Section with Side-by-Side Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Interactive Bullet Rewrites ({data.bullet_rewrites.length})
            </h2>
            <p className="text-xs text-slate-400">
              Review side-by-side. Accept, edit in-place, or reject. Fill in highlighted <span className="text-amber-400 font-semibold">[placeholders]</span> with your genuine metrics.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({data.bullet_rewrites.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'pending' ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterMode('accepted')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'accepted' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Accepted ({acceptedCount})
            </button>
            <button
              onClick={() => setFilterMode('rejected')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                filterMode === 'rejected' ? 'bg-slate-800 text-red-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>
        </div>

        {/* Bullets List */}
        <div className="space-y-4">
          {data.bullet_rewrites.map((bullet, idx) => {
            const state = bulletStates[idx] || {
              status: 'pending',
              currentText: bullet.improved,
              isEditing: false,
            };

            // Filtering check
            if (filterMode === 'pending' && state.status !== 'pending') return null;
            if (filterMode === 'accepted' && state.status !== 'accepted' && state.status !== 'edited')
              return null;
            if (filterMode === 'rejected' && state.status !== 'rejected') return null;

            const isAccepted = state.status === 'accepted' || state.status === 'edited';
            const isRejected = state.status === 'rejected';

            return (
              <div
                key={idx}
                className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                  isAccepted
                    ? 'border-emerald-600/70 shadow-xs'
                    : isRejected
                    ? 'border-red-900/60 opacity-60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Bullet Header Bar */}
                <div className="px-5 py-3 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[11px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Bullet Point Optimization
                    </span>

                    {/* Status Pill */}
                    {state.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                        <Check className="w-3 h-3" />
                        <span>Accepted</span>
                      </span>
                    )}
                    {state.status === 'edited' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                        <Edit3 className="w-3 h-3" />
                        <span>Custom Edited</span>
                      </span>
                    )}
                    {state.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800/60">
                        <X className="w-3 h-3" />
                        <span>Rejected (Keeps Original)</span>
                      </span>
                    )}
                    {state.status === 'pending' && (
                      <span className="text-[11px] text-slate-500 font-medium">Pending Review</span>
                    )}
                  </div>

                  {/* Actions for this bullet */}
                  <div className="flex items-center gap-1.5">
                    {state.isEditing ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-500 text-slate-950 font-semibold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save Edit</span>
                        </button>
                        <button
                          onClick={() => handleCancelEdit(idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <span>Cancel</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStatusChange(idx, 'accepted')}
                          title="Accept improved bullet"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            state.status === 'accepted'
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => handleStartEditing(idx)}
                          title="Edit improved text inline"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleStatusChange(idx, 'rejected')}
                          title="Reject and keep original"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                            state.status === 'rejected'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-950/30 hover:bg-red-900/60 text-red-300 border border-red-900/50'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        {(state.status !== 'pending' || state.currentText !== bullet.improved) && (
                          <button
                            onClick={() => handleResetBullet(idx)}
                            title="Reset to default suggestion"
                            className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Side-by-Side Comparison Container */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Left Column: Original Bullet */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      <span>Original Resume Bullet</span>
                      <span className="text-[10px] text-slate-500">Unmodified</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-400 font-mono leading-relaxed min-h-[90px] flex items-start">
                      <span className="text-slate-500 mr-2 shrink-0">•</span>
                      <span>{bullet.original}</span>
                    </div>
                  </div>

                  {/* Right Column: Improved Bullet with Highlighted Placeholders */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-teal-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Tailored Proposal</span>
                      </span>
                      {bullet.needs_user_input && (
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                          Needs User Confirmation
                        </span>
                      )}
                    </div>

                    {state.isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={state.currentText}
                          onChange={(e) => handleTextChange(idx, e.target.value)}
                          className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-teal-500 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
                          placeholder="Edit improved bullet text directly..."
                        />
                        <div className="text-[11px] text-slate-500">
                          Replace placeholders like [add metric] with your verified numbers.
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`p-3.5 rounded-xl border text-xs sm:text-sm font-mono leading-relaxed min-h-[90px] flex items-start ${
                          isAccepted
                            ? 'bg-emerald-950/20 border-emerald-600/50 text-slate-100'
                            : isRejected
                            ? 'bg-slate-950/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-950 border-slate-800 text-slate-100'
                        }`}
                      >
                        <span className="text-teal-400 mr-2 shrink-0">•</span>
                        <div className="space-y-1 w-full">
                          {renderWithHighlightedPlaceholders(state.currentText)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer notes for this bullet: Reason & User Input Needed */}
                <div className="px-5 py-3 bg-slate-950/40 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-slate-400 text-[11px] leading-relaxed">
                    <strong className="text-slate-300">Why this helps: </strong>
                    {bullet.reason}
                  </div>

                  {bullet.needs_user_input && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-800/60 text-amber-300 text-[11px] shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{bullet.needs_user_input}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Grid: Keywords to Add if True + Skills to Learn First */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Keywords to Add IF True */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Keywords to Add (ONLY IF Truthful)
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            These terms are highlighted in the job description. If you worked with these concepts during coursework or projects, weave them into your skill tags or project bullets.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {data.keywords_to_add_if_true.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-colors"
              >
                <span>+</span>
                <span>{kw}</span>
              </span>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Ethical Notice:</strong> Do not copy keywords if you cannot answer a 10-minute technical drill down during an Indian startup or MNC technical interview.
            </span>
          </div>
        </div>

        {/* Skills to Learn First (Targeted Gaps) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Skills to Learn First (Prioritized Gaps)
            </h3>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Prioritized by high impact on hiring decisions, complete with free official documentation and resources:
          </p>

          <div className="space-y-3 pt-1">
            {data.skills_to_learn_first.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 hover:border-teal-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                    {item.skill}
                  </span>
                  <span className="text-[10px] text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/50">
                    Free Resource
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.why}</p>
                <div className="text-[11px] text-slate-400 font-mono pt-0.5">
                  Resource: {item.free_resource_type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Screen Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
        <button
          onClick={onBackToReport}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Match Report</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAllAccepted}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-teal-400" />
            <span>Copy All Accepted</span>
          </button>

          {onProceedToInterview && (
            <button
              onClick={onProceedToInterview}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer"
            >
              <span>Step 4: Practice Interview</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
