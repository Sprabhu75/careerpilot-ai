/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Send,
  Copy,
  Check,
  Linkedin,
  Mail,
  Users,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

interface ColdOutreachProps {
  resumeText: string;
}

export const ColdOutreach: React.FC<ColdOutreachProps> = ({ resumeText }) => {
  const [targetCompany, setTargetCompany] = useState<string>('Razorpay');
  const [targetRole, setTargetRole] = useState<string>('Software Development Engineer 1 (Frontend)');
  const [recipientType, setRecipientType] = useState<string>('College Alumni at Company');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [outreachData, setOutreachData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cold-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetCompany,
          targetRole,
          recipientType,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate outreach');
      const data = await response.json();
      setOutreachData(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Authentic Indian Tech Outreach & Referral Pitches
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Generates high-response cold messages citing ONLY your verifiable projects and credentials. No spam, no fabricated experience.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Drafting Messages...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Generate Outreach Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inputs Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Target Company
          </label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="e.g. Swiggy, TCS Digital, Razorpay"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Target Job Title
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. SDE-1, Data Analyst"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Primary Recipient Angle
          </label>
          <select
            value={recipientType}
            onChange={(e) => setRecipientType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="College Alumni at Company">College Alumni Senior (Referral)</option>
            <option value="Engineering Manager / Tech Lead">Engineering Manager / Tech Lead</option>
            <option value="Technical Recruiter / Talent Acquisition">Technical Recruiter (TA)</option>
          </select>
        </div>
      </div>

      {/* Generated Templates */}
      {outreachData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. LinkedIn Connection Note */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-white">LinkedIn Connection Note</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {outreachData.linkedInConnectionNote?.length || 0} / 300 chars
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Under 300-char limit for personalized invite note.
                </p>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {outreachData.linkedInConnectionNote}
                </div>
              </div>

              <button
                onClick={() => handleCopy(outreachData.linkedInConnectionNote, 'linkedin')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'linkedin' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Note</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Alumni Referral Ask */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white">Alumni Referral Request</h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-medium">Warm senior tone</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Culturally respectful tone with concrete project proof & job ID.
                </p>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {outreachData.alumniReferralMessage}
                </div>
              </div>

              <button
                onClick={() => handleCopy(outreachData.alumniReferralMessage, 'alumni')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'alumni' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Message</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Hiring Manager Cold Email */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-xs font-bold text-white">Engineering Lead Email</h3>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-medium">Direct pitch</span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Subject line + concise bullet highlights.
                </p>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                  <div className="text-slate-400 font-sans font-bold border-b border-slate-800/80 pb-1 mb-2">
                    Subject: {outreachData.subjectLine}
                  </div>
                  {outreachData.hiringManagerDirectEmail}
                </div>
              </div>

              <button
                onClick={() => handleCopy(outreachData.hiringManagerDirectEmail, 'email')}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'email' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Indian Outreach Guidelines */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white">
                Best Practices for Indian Tech Job Outreach
              </h4>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              {(outreachData.tipsForIndianOutreach || []).map((tip: string, i: number) => (
                <li key={i} className="p-3 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
                  <span className="text-cyan-400 font-mono font-bold block mb-1">0{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
