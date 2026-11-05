/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, AppScreen } from './components/Header.tsx';
import { RulesBanner } from './components/RulesBanner.tsx';
import { HomeScreen } from './components/HomeScreen.tsx';
import { MatchReportScreen } from './components/MatchReportScreen.tsx';
import { TailoringScreen, TailoringData } from './components/TailoringScreen.tsx';
import { InterviewPracticeScreen } from './components/InterviewPracticeScreen.tsx';
import { ApplicationTrackerScreen } from './components/ApplicationTrackerScreen.tsx';
import { SAMPLE_PROFILES } from './data/sample-profiles.ts';
import {
  MatchRequirement,
  getStoredApplications,
  addStoredApplication,
  clearAllUserData,
  getClientRateLimitState,
  recordAnalysisAttempt,
  RateLimitState,
} from './utils/career-pilot-logic.ts';
import {
  Shield,
  FileSearch,
  Sparkles,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Clock,
  Layers,
  MessageSquare,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';

interface AnalysisResult {
  role_title: string;
  requirements: MatchRequirement[];
  top_strengths: string[];
  top_gaps: string[];
  summary: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('sde1-mern');
  const [resumeText, setResumeText] = useState<string>(SAMPLE_PROFILES[0].resumeText);
  const [jobDescriptionText, setJobDescriptionText] = useState<string>(
    SAMPLE_PROFILES[0].jobDescriptionText
  );

  // Analysis and Tailoring states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [tailoringData, setTailoringData] = useState<TailoringData | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  // Rate Limiting & Tracker state
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>(getClientRateLimitState());
  const [trackerCount, setTrackerCount] = useState<number>(0);

  useEffect(() => {
    const apps = getStoredApplications();
    setTrackerCount(apps.length);
    setRateLimitState(getClientRateLimitState());
  }, []);

  // Run full analysis calling the backend endpoints
  const handleRunAnalysis = async () => {
    if (!resumeText.trim() || !jobDescriptionText.trim()) {
      setAnalysisError('Please provide both candidate resume text and target job description.');
      return;
    }

    // Rate Limit check: 5 analyses per hour
    const rateLimit = getClientRateLimitState();
    if (!rateLimit.allowed) {
      setAnalysisError(
        `Rate limit reached: Maximum 5 analyses per hour allowed per user. Please wait ${rateLimit.resetInMinutes} minutes before analyzing another resume.`
      );
      return;
    }

    setIsLoading(true);
    setAnalysisError(null);
    setDeleteFeedback(null);

    try {
      // 1. Fetch requirements comparison for Screen 2 via /api/analyze
      const comparePromise = fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-client-id': 'browser-user-session',
        },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
        }),
      });

      // 2. Fetch tailoring recommendations for Screen 3 via /api/tailor
      const tailorPromise = fetch('/api/tailor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-client-id': 'browser-user-session',
        },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
        }),
      });

      const [compareRes, tailorRes] = await Promise.all([comparePromise, tailorPromise]);

      if (!compareRes.ok) {
        const errJson = await compareRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to compare resume with job requirements.');
      }

      if (!tailorRes.ok) {
        const errJson = await tailorRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate tailored resume suggestions.');
      }

      const compareOutput = await compareRes.json();
      const tailorOutput = await tailorRes.json();

      // Record successful analysis in client sliding window
      recordAnalysisAttempt();
      setRateLimitState(getClientRateLimitState());

      setAnalysisData(compareOutput);
      setTailoringData(tailorOutput);
      setIsLoading(false);
      setCurrentScreen('match_report');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(
        err.message || 'An error occurred during evaluation. Please verify connection and retry.'
      );
      setIsLoading(false);
    }
  };

  const handleResetToDemo = () => {
    setSelectedProfileId('sde1-mern');
    setResumeText(SAMPLE_PROFILES[0].resumeText);
    setJobDescriptionText(SAMPLE_PROFILES[0].jobDescriptionText);
    setAnalysisError(null);
    setDeleteFeedback(null);
    setCurrentScreen('home');
  };

  // Rule: "Delete my data" button
  const handleDeleteAllData = () => {
    clearAllUserData();
    setResumeText('');
    setJobDescriptionText('');
    setAnalysisData(null);
    setTailoringData(null);
    setTrackerCount(0);
    setAnalysisError(null);
    setDeleteFeedback('All candidate data, resume text, and local application records have been deleted.');
    setCurrentScreen('home');
    setTimeout(() => setDeleteFeedback(null), 5000);
  };

  // Track job directly from Match Report into Application Tracker
  const handleTrackCurrentApplication = (roleTitle: string, matchScore: number) => {
    const companyMatch = jobDescriptionText.match(/(?:Company|Organization|At)\s*:\s*([^\n\r,]+)/i);
    const companyName = companyMatch ? companyMatch[1].trim() : (roleTitle.includes('Frontend') ? 'Razorpay' : 'Target Tech Company');

    const updated = addStoredApplication({
      company: companyName,
      role: roleTitle || 'Software Engineer',
      dateApplied: new Date().toISOString().split('T')[0],
      status: 'Applied',
      matchScore,
      notes: `Evaluated on CareerPilot AI with an estimated match score of ${matchScore}%. Review strengths and gaps in Match Report.`,
      location: 'Bengaluru / Hybrid',
      portal: 'CareerPilot Verified Application',
    });
    setTrackerCount(updated.length);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header with 5 navigation steps */}
      <Header
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        hasAnalyzed={Boolean(analysisData && tailoringData)}
        onResetToDemo={handleResetToDemo}
        onDeleteData={handleDeleteAllData}
        trackerCount={trackerCount}
      />

      {/* Rules Banner reinforcing strict evidence-grounding */}
      <RulesBanner />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Delete Data Confirmation Toast */}
        {deleteFeedback && (
          <div className="p-4 rounded-xl bg-teal-950/70 border border-teal-800 text-xs text-teal-300 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{deleteFeedback}</span>
            </div>
            <button
              onClick={() => setDeleteFeedback(null)}
              className="text-xs text-teal-400 hover:text-white underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-teal-400 animate-spin" />
              </div>
              <h2 className="text-lg font-bold text-white">
                Evaluating Candidate Alignment & Fact Evidence...
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Comparing qualifications against job description criteria, calculating in-code estimated match percentage, and preparing bullet rewrites with placeholder metrics.
              </p>
            </div>

            {/* Skeleton Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-40 rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="h-4 w-1/3 bg-slate-800 rounded" />
                <div className="h-8 w-1/2 bg-slate-800 rounded" />
                <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
              </div>
              <div className="h-40 rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
                <div className="h-3 w-full bg-slate-800/60 rounded" />
                <div className="h-3 w-5/6 bg-slate-800/60 rounded" />
              </div>
              <div className="h-40 rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-3">
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
                <div className="h-3 w-full bg-slate-800/60 rounded" />
                <div className="h-3 w-4/5 bg-slate-800/60 rounded" />
              </div>
            </div>

            <div className="h-64 rounded-xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
              <div className="h-5 w-1/4 bg-slate-800 rounded" />
              <div className="space-y-2">
                <div className="h-8 w-full bg-slate-800/40 rounded" />
                <div className="h-8 w-full bg-slate-800/40 rounded" />
                <div className="h-8 w-full bg-slate-800/40 rounded" />
              </div>
            </div>
          </div>
        )}

        {/* Screen 1: Home (Upload / Paste / Profile Ingestion) */}
        {!isLoading && currentScreen === 'home' && (
          <HomeScreen
            resumeText={resumeText}
            setResumeText={setResumeText}
            jobDescriptionText={jobDescriptionText}
            setJobDescriptionText={setJobDescriptionText}
            onAnalyse={handleRunAnalysis}
            isLoading={isLoading}
            errorMsg={analysisError}
            onRetry={handleRunAnalysis}
            onDeleteData={handleDeleteAllData}
            rateLimitState={rateLimitState}
          />
        )}

        {/* Screen 2: Match Report */}
        {!isLoading && currentScreen === 'match_report' && (
          analysisData ? (
            <MatchReportScreen
              roleTitle={analysisData.role_title}
              requirements={analysisData.requirements}
              topStrengths={analysisData.top_strengths}
              topGaps={analysisData.top_gaps}
              summary={analysisData.summary}
              onProceedToTailoring={() => setCurrentScreen('tailoring')}
              onBackToHome={() => setCurrentScreen('home')}
              onProceedToInterview={() => setCurrentScreen('interview_practice')}
              onTrackJob={handleTrackCurrentApplication}
              onDeleteData={handleDeleteAllData}
            />
          ) : (
            /* Friendly Empty State if navigated before analysis */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-white">No Match Report Generated Yet</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Please upload or paste your resume and target job description on the Home screen to generate an evidence-backed match report.
              </p>
              <button
                onClick={() => setCurrentScreen('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer"
              >
                <span>Go to Step 1: Ingestion</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )
        )}

        {/* Screen 3: Tailoring */}
        {!isLoading && currentScreen === 'tailoring' && (
          tailoringData ? (
            <TailoringScreen
              data={tailoringData}
              roleTitle={analysisData?.role_title || 'Target Role'}
              onBackToReport={() => setCurrentScreen('match_report')}
              onBackToHome={() => setCurrentScreen('home')}
              onProceedToInterview={() => setCurrentScreen('interview_practice')}
            />
          ) : (
            /* Friendly Empty State if navigated before analysis */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-white">No Tailoring Data Available Yet</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Tailoring requires analyzing your verified resume against the job description to propose honest, non-fabricated bullet rewrites.
              </p>
              <button
                onClick={() => setCurrentScreen('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer"
              >
                <span>Run Resume Analysis First</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )
        )}

        {/* Screen 4: Interview Practice */}
        {!isLoading && currentScreen === 'interview_practice' && (
          resumeText.trim() && jobDescriptionText.trim() ? (
            <InterviewPracticeScreen
              roleTitle={analysisData?.role_title || 'Target Role'}
              topGaps={analysisData?.top_gaps || [
                'Automated Unit Testing with Jest / RTL',
                'GraphQL API Integration',
                'Core Web Vitals Profiling & Optimization',
              ]}
              resumeText={resumeText}
              jobDescriptionText={jobDescriptionText}
              onBackToTailoring={() => setCurrentScreen('tailoring')}
              onBackToHome={() => setCurrentScreen('home')}
            />
          ) : (
            /* Friendly Empty State if navigated before entering resume and JD */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-teal-400" />
              </div>
              <h2 className="text-lg font-bold text-white">No Resume & Job Description Loaded</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Interview practice dynamically tailors 10 questions to the exact target job description and your identified resume gaps.
              </p>
              <button
                onClick={() => setCurrentScreen('home')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors cursor-pointer"
              >
                <span>Go to Step 1: Ingestion</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          )
        )}

        {/* Screen 5: Application Tracker */}
        {!isLoading && currentScreen === 'application_tracker' && (
          <ApplicationTrackerScreen
            onBackToHome={() => setCurrentScreen('home')}
            onNavigateToMatchReport={() => setCurrentScreen('match_report')}
          />
        )}
      </main>

      {/* Clean Footer (No Telemetry or status tickers) */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">CareerPilot AI</span>
            <span>· Built for Indian students, freshers & early-career engineers</span>
          </div>

          <div className="text-[11px] text-slate-500">
            Rules: Verbatim resume snippets &lt;20 words · Never fabricates metrics · Code-calculated estimated match
          </div>
        </div>
      </footer>
    </div>
  );
}
