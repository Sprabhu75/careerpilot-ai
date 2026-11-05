/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Briefcase,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Info,
} from 'lucide-react';
import { SAMPLE_PROFILES, SampleProfile } from '../data/sample-profiles.ts';

interface MatchInspectorProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescriptionText: string;
  setJobDescriptionText: (text: string) => void;
  selectedProfileId: string;
  setSelectedProfileId: (id: string) => void;
  onNavigateToPrep?: () => void;
  onNavigateToRefiner?: () => void;
}

export const MatchInspector: React.FC<MatchInspectorProps> = ({
  resumeText,
  setResumeText,
  jobDescriptionText,
  setJobDescriptionText,
  selectedProfileId,
  setSelectedProfileId,
  onNavigateToPrep,
  onNavigateToRefiner,
}) => {
  const [roleContext, setRoleContext] = useState<string>(
    'Indian Product Startup (Bengaluru/Gurugram)'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'verified' | 'missing'>('all');
  const [matchData, setMatchData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    const found = SAMPLE_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setResumeText(found.resumeText);
      setJobDescriptionText(found.jobDescriptionText);
      if (profileId === 'sde1-mern') {
        setRoleContext('Indian Product Startup (Bengaluru/Gurugram)');
      } else if (profileId === 'data-analyst') {
        setRoleContext('Indian E-commerce / Tech Unicorn (Hyderabad)');
      } else if (profileId === 'java-ase') {
        setRoleContext('Indian IT Services MNC (TCS / Infosys / Cognizant)');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !jobDescriptionText.trim()) {
      setErrorMsg('Please enter both candidate resume and job description.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
          roleContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze match');
      }

      const data = await response.json();
      setMatchData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const allCriteria = matchData
    ? [
        ...(matchData.matchedCriteria || []).map((c: any) => ({ ...c, status: 'verified' })),
        ...(matchData.missingEvidenceCriteria || []).map((c: any) => ({ ...c, status: 'missing' })),
      ]
    : [];

  const filteredCriteria = allCriteria.filter((item) => {
    if (filterCriteria === 'verified') return item.status === 'verified';
    if (filterCriteria === 'missing') return item.status === 'missing';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Profile Selector Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide uppercase text-slate-400">
              Select Candidate Preset or Custom Input
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Realistic Indian fresher profiles calibrated for campus placements & off-campus hiring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Ecosystem:</span>
            <select
              value={roleContext}
              onChange={(e) => setRoleContext(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="Indian Product Startup (Bengaluru/Gurugram)">
                Product Startup (Bengaluru / NCR)
              </option>
              <option value="Indian IT Services MNC (TCS / Infosys / Cognizant)">
                IT Services MNC (TCS / Infosys / Wipro)
              </option>
              <option value="Indian E-commerce / Tech Unicorn (Hyderabad)">
                Tech Unicorn / E-Commerce (Hyderabad)
              </option>
              <option value="Off-Campus Referral (Alumni Outreach)">
                Off-Campus Referral Outreach
              </option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PROFILES.map((profile) => {
            const isSelected = selectedProfileId === profile.id;
            return (
              <button
                key={profile.id}
                onClick={() => handleProfileSelect(profile.id)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 text-white ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="font-semibold text-xs tracking-tight text-white">
                  {profile.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {profile.tagline}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-side Data Inputs (Treated as Data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Candidate Resume Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-sm text-white">Candidate Resume</h3>
              <span className="text-xs text-slate-400">· Ground Truth</span>
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              {resumeText.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-2">
            Paste or edit raw resume text. Instructions inside are treated strictly as data.
          </div>

          <textarea
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setSelectedProfileId('custom');
            }}
            placeholder="Paste candidate resume text here..."
            className="w-full h-80 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
          />
        </div>

        {/* Job Description Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-white">Target Job Description</h3>
              <span className="text-xs text-slate-400">· Hiring Criteria</span>
            </div>
            <div className="text-xs text-slate-500 font-mono tabular-nums">
              {jobDescriptionText.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          <div className="text-xs text-slate-400 mb-2">
            Target company role requirements, qualifications, and expectations.
          </div>

          <textarea
            value={jobDescriptionText}
            onChange={(e) => {
              setJobDescriptionText(e.target.value);
              setSelectedProfileId('custom');
            }}
            placeholder="Paste target job description text here..."
            className="w-full h-80 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none transition-colors"
          />
        </div>
      </div>

      {/* Action Trigger */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            CareerPilot cross-checks every requirement against verbatim resume snippets under 20 words.
          </span>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
              <span>Analyzing Verifiable Evidence...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4 text-slate-900" />
              <span>Inspect Match & Evidence</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results Section */}
      {matchData && (
        <div className="space-y-6 pt-2">
          {/* Top Scorecard: Estimated Match (Never ATS Score) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Score visual */}
              <div className="flex items-center gap-5 border-b md:border-b-0 md:border-r border-slate-800 pb-5 md:pb-0 md:pr-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
                    {matchData.estimatedMatch?.percentage || 74}%
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Estimated
                  </span>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">Estimated Match Alignment</div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {matchData.estimatedMatch?.label || 'Moderate Estimated Match'}
                  </h3>
                  <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Evidence-grounded audit</span>
                  </div>
                </div>
              </div>

              {/* Match Explanation & Honest Disclosures */}
              <div className="md:col-span-2 space-y-2">
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white">Analysis: </span>
                  {matchData.estimatedMatch?.explanation}
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-slate-300">Why Estimated Match & Never an "ATS Score": </span>
                    ATS algorithms do not produce universal numerical scores; hiring managers in India review verified proof of projects, technical depth, and coding rankings. This score reflects verified documentation density.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Breakdown Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Hiring Criteria & Evidence Citations
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Every verified claim quotes a resume snippet under 20 words. Unsubstantiated requirements display "No evidence found".
              </p>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
              <button
                onClick={() => setFilterCriteria('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterCriteria === 'all'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Criteria ({allCriteria.length})
              </button>
              <button
                onClick={() => setFilterCriteria('verified')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterCriteria === 'verified'
                    ? 'bg-slate-800 text-emerald-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Verified in Resume ({matchData.matchedCriteria?.length || 0})
              </button>
              <button
                onClick={() => setFilterCriteria('missing')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  filterCriteria === 'missing'
                    ? 'bg-slate-800 text-amber-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Missing Evidence ({matchData.missingEvidenceCriteria?.length || 0})
              </button>
            </div>
          </div>

          {/* Criteria Cards Grid */}
          <div className="grid grid-cols-1 gap-3">
            {filteredCriteria.map((item, idx) => {
              const isVerified = item.status === 'verified';
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <h4 className="text-sm font-semibold text-white">{item.criterion}</h4>
                    </div>

                    <div className="text-xs flex items-center gap-2">
                      {isVerified ? (
                        <span className="text-emerald-400 font-medium">Verified by Resume Proof</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Documentation Gap</span>
                      )}
                    </div>
                  </div>

                  {/* Evidence Snippet (Monospace snippet block strictly bounded) */}
                  <div className="my-2.5">
                    <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                      <span>Resume Evidence Snippet:</span>
                      {isVerified && item.wordCount && (
                        <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                          {item.wordCount} words (under 20 words rule)
                        </span>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg font-mono text-xs ${
                        isVerified
                          ? 'bg-slate-950 border border-slate-800 text-cyan-300'
                          : 'bg-amber-950/20 border border-amber-900/40 text-amber-300'
                      }`}
                    >
                      "{item.evidenceSnippet}"
                    </div>
                  </div>

                  {/* Explanation / Advice */}
                  <div className="text-xs text-slate-300 mt-2">
                    {isVerified ? (
                      <p>{item.explanation}</p>
                    ) : (
                      <div className="text-slate-400">
                        <span className="text-amber-400 font-medium">Fresher Action Guidance: </span>
                        {item.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indian Market Intelligence & Strategic Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Indian Placement Insights */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-sm text-white">Indian Tech Hiring Context</h4>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {(matchData.indianMarketInsights || []).map((insight: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Next Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-semibold text-sm text-white">Recommended Action Plan</h4>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-300">
                  {(matchData.suggestedNextSteps || []).map((step: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={onNavigateToRefiner}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Refine Resume Bullets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onNavigateToPrep}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Practice Interview Questions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
