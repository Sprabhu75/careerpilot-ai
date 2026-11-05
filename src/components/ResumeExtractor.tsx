/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Cpu,
  Award,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { StructuredResumeData } from '../utils/career-pilot-logic.ts';

interface ResumeExtractorProps {
  resumeText: string;
}

export const ResumeExtractor: React.FC<ResumeExtractorProps> = ({ resumeText }) => {
  const [inputText, setInputText] = useState<string>(resumeText);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<StructuredResumeData | null>(null);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual');

  const handleExtract = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/extract-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: inputText }),
      });

      if (!response.ok) throw new Error('Failed to extract structured data');
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Structured Resume & Issue Extractor
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Extracts strict JSON containing education, experience, projects, skills, certifications, and an honest audit of bullet issues (unclear phrasing, missing metrics, formatting problems).
            </p>
          </div>

          <button
            onClick={handleExtract}
            disabled={isLoading || !inputText.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Extracting JSON & Issues...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Extract Structured Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Input Resume Text */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white">Resume Text to Parse</label>
          <span className="text-xs text-slate-500 font-mono">
            {inputText.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste candidate resume text..."
          className="w-full h-44 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
        />
      </div>

      {/* Extracted Output */}
      {data && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Extraction Results: <span className="text-cyan-400">{data.name}</span>
              </h3>
              <span className="text-xs text-slate-400">· {data.issues?.length || 0} Issues Detected</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setViewMode('visual')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    viewMode === 'visual'
                      ? 'bg-slate-800 text-cyan-400 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visual Breakdown
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    viewMode === 'json'
                      ? 'bg-slate-800 text-cyan-400 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JSON Payload
                </button>
              </div>

              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedJson ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {viewMode === 'json' ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 overflow-x-auto">
              <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Issues Section */}
              {data.issues && data.issues.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Resume Issues Audit ({data.issues.length})
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400">
                    Specific weaknesses flagged for unclear action verbs, absent metrics, or formatting density:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {data.issues.map((iss, i) => (
                      <div
                        key={i}
                        className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] uppercase font-bold text-amber-400">
                            {iss.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="font-mono text-slate-200">"{iss.bullet}"</div>
                        <div className="text-slate-400 text-[11px]">
                          <span className="text-slate-300 font-semibold">Diagnosis: </span>
                          {iss.whyWeak}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education & Experience Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Education */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Education</h4>
                  </div>
                  <div className="space-y-2">
                    {(data.education || []).map((edu, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-white">{edu.degree}</div>
                        <div className="text-slate-400">{edu.institution}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          Year: {edu.year} · Score: {edu.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Experience</h4>
                  </div>
                  <div className="space-y-2">
                    {(data.experience || []).map((exp, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
                        <div className="font-semibold text-white">{exp.role} · {exp.company}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{exp.duration}</div>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5 pt-1">
                          {exp.bullets.map((b, bi) => (
                            <li key={bi} className="font-mono text-[11px]">{b}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Projects</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(data.projects || []).map((proj, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
                      <div className="font-semibold text-white">{proj.name}</div>
                      {proj.tech?.length > 0 && (
                        <div className="text-cyan-400 text-[11px] font-mono">
                          Tech: {proj.tech.join(', ')}
                        </div>
                      )}
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {proj.bullets.map((b, bi) => (
                          <li key={bi} className="font-mono text-[11px] leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills & Certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Skills</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(data.skills || []).map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Certifications & Achievements</h4>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {(data.certifications || []).map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
