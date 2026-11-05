/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Filter,
  Award,
  AlertTriangle,
  Info,
  Check,
  X,
  Download,
  Trash2,
  Briefcase,
  Printer,
} from 'lucide-react';
import { MatchRequirement, computeEstimatedMatchScore } from '../utils/career-pilot-logic.ts';

interface MatchReportScreenProps {
  roleTitle: string;
  requirements: MatchRequirement[];
  topStrengths: string[];
  topGaps: string[];
  summary: string;
  onProceedToTailoring: () => void;
  onBackToHome: () => void;
  onProceedToInterview?: () => void;
  onTrackJob?: (roleTitle: string, matchScore: number) => void;
  onDeleteData?: () => void;
}

export const MatchReportScreen: React.FC<MatchReportScreenProps> = ({
  roleTitle,
  requirements,
  topStrengths,
  topGaps,
  summary,
  onProceedToTailoring,
  onBackToHome,
  onProceedToInterview,
  onTrackJob,
  onDeleteData,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'must_have' | 'matched' | 'partial' | 'no_evidence'>('all');
  const [showFormulaTooltip, setShowFormulaTooltip] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [trackedSuccess, setTrackedSuccess] = useState<boolean>(false);

  // Compute estimated match percentage strictly IN CODE using the mandated formula:
  // must_have matched = 1, partial = 0.5, no_evidence = 0
  // weighted 70% must-have and 30% nice-to-have.
  const scoreData = computeEstimatedMatchScore(requirements);

  const filteredRequirements = requirements.filter((req) => {
    if (filterType === 'must_have') return req.type === 'must_have';
    if (filterType === 'matched') return req.status === 'matched';
    if (filterType === 'partial') return req.status === 'partial';
    if (filterType === 'no_evidence') return req.status === 'no_evidence';
    return true;
  });

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleTrackJobClick = () => {
    if (onTrackJob) {
      onTrackJob(roleTitle, scoreData.percentage);
      setTrackedSuccess(true);
      setTimeout(() => setTrackedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 print:p-0 print:space-y-4 print:text-black">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Resume or Job Description</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
            Match Report: <span className="text-teal-400">{roleTitle || 'Target Role'}</span>
          </h1>
        </div>

        {/* Action Controls Group: Download as PDF, Track Job, Delete Data, Proceed */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Download Report as PDF button */}
          <button
            onClick={handleDownloadPDF}
            title="Download formatted match report as PDF or print"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Download report as PDF</span>
          </button>

          {/* Track in Application Tracker */}
          {onTrackJob && (
            <button
              onClick={handleTrackJobClick}
              title="Track this job in your Application Tracker"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 rounded-xl border border-cyan-800/60 transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span>{trackedSuccess ? 'Tracked in Tracker!' : 'Track This Job'}</span>
            </button>
          )}

          {/* Delete my data button */}
          {onDeleteData && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              title="Purge all candidate resume & analysis data"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete my data</span>
            </button>
          )}

          <button
            onClick={onProceedToTailoring}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            <span>Proceed to Tailoring</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Screen 2 Top Metric: Estimated Match Percentage (Computed in Code) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Score Visual */}
          <div className="md:col-span-4 flex items-center gap-5 border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
              <span className="text-4xl font-extrabold text-teal-400 font-mono tabular-nums">
                {scoreData.percentage}%
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-0.5">
                Match
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white">
                  Estimated match
                </span>
                {/* Info Tooltip Trigger */}
                <button
                  onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                  className="text-slate-400 hover:text-teal-300 transition-colors cursor-pointer focus:outline-none"
                  title="View computation formula"
                  aria-label="View computation formula"
                >
                  <HelpCircle className="w-4 h-4 text-teal-400" />
                </button>
              </div>

              {/* Exact required label */}
              <div className="text-xs text-slate-400 mt-1 font-medium">
                Estimated match, not an employer ATS score
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span>Must-Have: {scoreData.mustHavePoints}/{scoreData.mustHaveCount}</span>
                <span>·</span>
                <span>Nice-to-Have: {scoreData.niceToHavePoints}/{scoreData.niceToHaveCount}</span>
              </div>
            </div>
          </div>

          {/* Explanation & Summary */}
          <div className="md:col-span-8 space-y-3">
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <span className="font-semibold text-white">Executive Summary: </span>
              {summary}
            </div>

            {/* Interactive Tooltip Card showing Formula */}
            {showFormulaTooltip && (
              <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/40 text-xs space-y-2 relative transition-all">
                <button
                  onClick={() => setShowFormulaTooltip(false)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>Exact Weighted Formula (Computed in Code)</span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  Estimated Match = (Must-Have Ratio × 70%) + (Nice-To-Have Ratio × 30%)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Status weights: <strong className="text-emerald-400">matched = 1.0</strong>, <strong className="text-amber-400">partial = 0.5</strong>, <strong className="text-slate-400">no_evidence = 0.0</strong>.
                  This ensures core baseline qualifications carry 70% weight, with secondary competencies accounting for 30%.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Strengths & Top Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Top Strengths (Verified Evidence)
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {topStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Gaps Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-white">
              Top Gaps (Missing Evidence)
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {topGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Table of Requirements */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Requirements Breakdown Table
            </h3>
            <p className="text-xs text-slate-400">
              Every requirement mapped with status badges and exact evidence quotes from your resume.
            </p>
          </div>

          {/* Filter segment control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'all' ? 'bg-slate-800 text-teal-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({requirements.length})
            </button>
            <button
              onClick={() => setFilterType('must_have')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'must_have' ? 'bg-slate-800 text-teal-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Must-Have ({scoreData.mustHaveCount})
            </button>
            <button
              onClick={() => setFilterType('matched')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'matched' ? 'bg-slate-800 text-emerald-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matched (Green)
            </button>
            <button
              onClick={() => setFilterType('partial')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'partial' ? 'bg-slate-800 text-amber-400 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Partial (Amber)
            </button>
            <button
              onClick={() => setFilterType('no_evidence')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'no_evidence' ? 'bg-slate-800 text-slate-300 shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              No Evidence (Grey)
            </button>
          </div>
        </div>

        {/* Requirements Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-1/4">Requirement</th>
                  <th className="py-3 px-3 w-28">Type & Category</th>
                  <th className="py-3 px-3 w-32">Status Badge</th>
                  <th className="py-3 px-4 w-1/3">Resume Evidence Snippet</th>
                  <th className="py-3 px-4">Evaluation Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRequirements.map((req, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      {/* Requirement description */}
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {req.text}
                      </td>

                      {/* Type & Category */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                              req.type === 'must_have'
                                ? 'bg-teal-950/60 text-teal-300 border border-teal-800/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700/50'
                            }`}
                          >
                            {req.type === 'must_have' ? 'Must-Have' : 'Nice-to-Have'}
                          </span>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {req.category.replace('_', ' ')}
                          </div>
                        </div>
                      </td>

                      {/* Status Badges: Green, Amber, Grey */}
                      <td className="py-3.5 px-3">
                        {req.status === 'matched' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Matched</span>
                          </span>
                        )}
                        {req.status === 'partial' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>Partial</span>
                          </span>
                        )}
                        {req.status === 'no_evidence' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span>No Evidence</span>
                          </span>
                        )}
                      </td>

                      {/* Evidence Snippet */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {req.evidence ? (
                          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-teal-300 leading-relaxed">
                            "{req.evidence}"
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No evidence found in resume</span>
                        )}
                      </td>

                      {/* Why Rationale */}
                      <td className="py-3.5 px-4 text-slate-300 text-[11px] leading-relaxed">
                        {req.why}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            ← Back to Inputs
          </button>
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {onProceedToInterview && (
            <button
              onClick={onProceedToInterview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Practice Questions (Screen 4)</span>
            </button>
          )}

          <button
            onClick={onProceedToTailoring}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors shadow-sm cursor-pointer"
          >
            <span>Step 3: Tailor Resume Bullets</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in">
            <div className="w-10 h-10 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-bold text-white">Delete All Candidate Data?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will permanently delete your uploaded resume, target job description, analysis results, and stored tracker data from browser memory and localStorage.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Keep My Data
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  if (onDeleteData) onDeleteData();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
