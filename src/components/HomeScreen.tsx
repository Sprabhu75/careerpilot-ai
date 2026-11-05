/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileCheck,
  AlertCircle,
  Briefcase,
  Sparkles,
  ArrowRight,
  Shield,
  RefreshCw,
  X,
  Compass,
} from 'lucide-react';
import { SAMPLE_PROFILES } from '../data/sample-profiles.ts';
import {
  truncateToWordLimit,
  getClientRateLimitState,
  RateLimitState,
} from '../utils/career-pilot-logic.ts';
import { Clock, Trash2 } from 'lucide-react';

interface HomeScreenProps {
  resumeText: string;
  setResumeText: (text: string) => void;
  jobDescriptionText: string;
  setJobDescriptionText: (text: string) => void;
  onAnalyse: () => void;
  isLoading: boolean;
  errorMsg: string | null;
  onRetry: () => void;
  onDeleteData?: () => void;
  rateLimitState?: RateLimitState;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  resumeText,
  setResumeText,
  jobDescriptionText,
  setJobDescriptionText,
  onAnalyse,
  isLoading,
  errorMsg,
  onRetry,
  onDeleteData,
  rateLimitState,
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [truncationWarning, setTruncationWarning] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const localRateLimit = rateLimitState || getClientRateLimitState();

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Rule 1: Reject non-PDF/DOCX files
    const nameLower = file.name.toLowerCase();
    const isPdf = nameLower.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx =
      nameLower.endsWith('.docx') ||
      file.type.includes('wordprocessingml') ||
      file.type.includes('officedocument');

    if (!isPdf && !isDocx) {
      setUploadError(
        'Unsupported file format. Please upload a PDF (.pdf) or Word DOCX (.docx) file only (max 2 MB), or use the Paste Text tab.'
      );
      return;
    }

    // Rule 2: Reject files over 2 MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError(
        `File size exceeds 2 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please upload a smaller file under 2 MB or paste resume text.`
      );
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        const response = await fetch('/api/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Content,
            fileName: file.name,
            fileType: file.type,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to extract text from file');
        }

        const data = await response.json();
        
        // Rule 3: Truncate text above 6,000 words with a warning
        const truncated = truncateToWordLimit(data.text || '', 6000);
        setResumeText(truncated.text);
        if (truncated.truncated || data.truncated) {
          setTruncationWarning(
            `Warning: Resume text exceeded 6,000 words limit and was automatically truncated to the first 6,000 words.`
          );
        } else {
          setTruncationWarning(null);
        }

        setIsUploading(false);
      };

      reader.onerror = () => {
        setUploadError('Failed to read file from disk. Please try again.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Error parsing document.');
      setIsUploading(false);
    }
  };

  const handleResumeTextChange = (text: string) => {
    const res = truncateToWordLimit(text, 6000);
    setResumeText(res.text);
    if (res.truncated) {
      setTruncationWarning(
        `Warning: Resume text exceeded 6,000 words limit and was automatically truncated to the first 6,000 words.`
      );
    } else if (truncationWarning?.includes('Resume text')) {
      setTruncationWarning(null);
    }
  };

  const handleJdTextChange = (text: string) => {
    const res = truncateToWordLimit(text, 6000);
    setJobDescriptionText(res.text);
    if (res.truncated) {
      setTruncationWarning(
        `Warning: Job description text exceeded 6,000 words limit and was automatically truncated to the first 6,000 words.`
      );
    } else if (truncationWarning?.includes('Job description')) {
      setTruncationWarning(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (profileId: string) => {
    const found = SAMPLE_PROFILES.find((p) => p.id === profileId);
    if (found) {
      setResumeText(found.resumeText);
      setJobDescriptionText(found.jobDescriptionText);
      setUploadedFileName(null);
      setInputMode('paste');
      setTruncationWarning(null);
    }
  };

  const resumeWordCount = resumeText.trim().split(/\s+/).filter(Boolean).length;
  const jdWordCount = jobDescriptionText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Privacy Note */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Screen 1: Candidate Ingestion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
            Evidence-Based Career Preparation for Indian Freshers
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Upload or paste your resume and target job description. CareerPilot AI evaluates your alignment strictly against verified facts—never hallucinating skills, employers, or metrics.
          </p>

          {/* Privacy Note Required */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-800/60 text-xs text-teal-300">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Privacy Note:</strong> Your resume is not stored unless you save it. Files are processed within your active browser session.
            </span>
          </div>
        </div>
      </div>

      {/* Preset Profiles Bar for Quick Exploration */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Quick Load: Realistic Indian Fresher Profiles
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Click to auto-populate resume & job description
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_PROFILES.map((profile) => (
            <button
              key={profile.id}
              onClick={() => handleLoadSample(profile.id)}
              className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-teal-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="font-semibold text-xs text-white group-hover:text-teal-300">
                {profile.name}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                {profile.tagline}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Inputs Grid: Resume on Left, Job Description on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Resume Upload / Paste */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                <h3 className="font-semibold text-sm text-white">Candidate Resume</h3>
                <span className="text-xs text-slate-500">· Max 2 MB</span>
              </div>

              {/* Mode switch: Upload vs Paste */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  onClick={() => setInputMode('upload')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    inputMode === 'upload'
                      ? 'bg-slate-800 text-teal-400 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setInputMode('paste')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    inputMode === 'paste'
                      ? 'bg-slate-800 text-teal-400 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {inputMode === 'upload' ? (
              <div className="space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-teal-400/70 bg-slate-950/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    {isUploading ? (
                      <RefreshCw className="w-5 h-5 text-teal-400 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 text-teal-400" />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {isUploading ? 'Extracting Text...' : 'Click to upload or drag & drop'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Supports PDF, DOCX, or plain text (up to 2 MB)
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadedFileName && !uploadError && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="font-mono font-medium truncate max-w-xs">{uploadedFileName}</span>
                      <span className="text-slate-500 font-mono">({resumeWordCount} words extracted)</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFileName(null);
                        setResumeText('');
                      }}
                      className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      title="Clear file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={resumeText}
                  onChange={(e) => handleResumeTextChange(e.target.value)}
                  placeholder="Paste candidate resume text directly (education, technical skills, internships, projects)..."
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 resize-none transition-colors"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Max limit: 6,000 words</span>
                  <span className={`tabular-nums ${resumeWordCount > 5500 ? 'text-amber-400 font-bold' : ''}`}>
                    {resumeWordCount} words
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500">
            Treated as strict data. Prompt instructions embedded in text are sanitized.
          </div>
        </div>

        {/* Card 2: Job Description */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-sm text-white">Target Job Description</h3>
              </div>
              <span className={`text-[11px] font-mono tabular-nums ${jdWordCount > 5500 ? 'text-amber-400 font-bold' : 'text-slate-500'}`}>
                {jdWordCount} words
              </span>
            </div>

            <textarea
              value={jobDescriptionText}
              onChange={(e) => handleJdTextChange(e.target.value)}
              placeholder="Paste target job description (role overview, responsibilities, required technical skills, qualifications)..."
              className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 resize-none transition-colors"
            />
          </div>

          <div className="text-[11px] text-slate-500">
            Requirements will be categorized into must-have and nice-to-have criteria.
          </div>
        </div>
      </div>

      {/* Word Count Truncation Warning Banner */}
      {truncationWarning && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{truncationWarning}</span>
          </div>
          <button
            onClick={() => setTruncationWarning(null)}
            className="text-amber-400 hover:text-white text-xs underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Error Banner with Retry */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/80 text-xs text-red-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={onRetry}
            className="px-3 py-1 rounded-md bg-red-900/60 hover:bg-red-800 text-xs font-medium text-white transition-colors cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Primary Action Button Bar with Rate Limit & Delete Data */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Left: Rate Limit & Delete Data */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>
              Analysis Quota: <strong className="text-teal-300 font-mono">{localRateLimit.remaining} / 5</strong> remaining this hour
            </span>
          </div>

          {onDeleteData && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete my data</span>
            </button>
          )}
        </div>

        {/* Right: Analyse Action */}
        <button
          onClick={onAnalyse}
          disabled={isLoading || resumeWordCount === 0 || jdWordCount === 0 || !localRateLimit.allowed}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-teal-500/20 cursor-pointer whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Analyzing Match & Evidence...</span>
            </>
          ) : (
            <>
              <span>Analyse</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </>
          )}
        </button>
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
                This will purge your uploaded resume text, job description, analysis results, and stored applications from browser session and localStorage.
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
