/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Send,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  Code2,
  Users,
  Compass,
  FileText,
  Lightbulb,
  Award,
} from 'lucide-react';
import {
  InterviewQuestion,
  AnswerEvaluation,
  countWords,
} from '../utils/career-pilot-logic.ts';

interface InterviewPracticeScreenProps {
  roleTitle?: string;
  topGaps?: string[];
  resumeText: string;
  jobDescriptionText: string;
  onBackToTailoring: () => void;
  onBackToHome: () => void;
}

type QuestionFilter = 'all' | 'technical' | 'behavioural' | 'scenario' | 'gaps';

export const InterviewPracticeScreen: React.FC<InterviewPracticeScreenProps> = ({
  roleTitle = 'Target Role',
  topGaps = [],
  resumeText,
  jobDescriptionText,
  onBackToTailoring,
  onBackToHome,
}) => {
  const [level, setLevel] = useState<'fresher' | '1-3 years'>('fresher');
  const [filter, setFilter] = useState<QuestionFilter>('all');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, AnswerEvaluation>>({});
  
  // Loading & Error states
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Practice Timer (2 minutes / 120 seconds default)
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Accordion toggle for "What a good answer covers"
  const [showCriteriaGuide, setShowCriteriaGuide] = useState<boolean>(true);
  const [copiedModelAnswer, setCopiedModelAnswer] = useState<boolean>(false);

  // Fetch or generate the 10 questions on mount or level change
  const fetchQuestions = async (targetLevel: 'fresher' | '1-3 years' = level) => {
    setIsLoadingQuestions(true);
    setQuestionsError(null);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescriptionText,
          topGaps,
          resumeText,
          level: targetLevel,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate interview questions.');
      }

      const data = await response.json();
      const loadedQuestions: InterviewQuestion[] = data.questions || [];
      setQuestions(loadedQuestions);
      if (loadedQuestions.length > 0) {
        setSelectedQuestionIndex(0);
      }
    } catch (err: any) {
      console.error('Error fetching interview questions:', err);
      setQuestionsError(err.message || 'Unable to generate interview questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (jobDescriptionText) {
      fetchQuestions(level);
    }
  }, [level]);

  // Timer interval handling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(120);
  };

  const currentQuestion = questions[selectedQuestionIndex] || questions[0];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || '' : '';
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;

  // Evaluate candidate answer
  const handleEvaluateCurrentAnswer = async () => {
    if (!currentQuestion || !currentAnswer.trim()) return;

    setIsEvaluating(true);
    setEvaluationError(null);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          what_a_good_answer_covers: currentQuestion.what_a_good_answer_covers,
          answer: currentAnswer,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to evaluate answer.');
      }

      const evalData: AnswerEvaluation = await response.json();
      setEvaluations((prev) => ({
        ...prev,
        [currentQuestion.id]: evalData,
      }));
    } catch (err: any) {
      console.error('Error evaluating answer:', err);
      setEvaluationError(err.message || 'Failed to evaluate answer. Please click retry.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Pre-load a high-quality sample answer for testing
  const handleLoadSampleAnswer = () => {
    if (!currentQuestion) return;

    let sample = '';
    if (currentQuestion.type === 'technical') {
      if (currentQuestion.targets_gap || currentQuestion.question.toLowerCase().includes('test')) {
        sample = `In automated testing, I test user-observable behaviors rather than internal state variables using React Testing Library and Jest. For asynchronous hooks or API state transitions, I use renderHook along with waitFor and act to ensure async promises resolve before assertions. Furthermore, I mock external endpoints with MSW (Mock Service Worker) to simulate both successful 200 payloads and error fallbacks cleanly without coupling tests to implementation internals.`;
      } else if (currentQuestion.question.toLowerCase().includes('graphql') || currentQuestion.question.toLowerCase().includes('rest')) {
        sample = `REST exposes rigid endpoints with fixed schemas, frequently causing over-fetching or multiple round-trips (under-fetching). GraphQL solves this by letting clients declare exact payload shapes through single POST requests. However, resolving nested relations in GraphQL schemas can trigger the N+1 database problem. To mitigate this, we implement DataLoader on the server side to batch and memoize database queries into a single SQL 'IN' statement.`;
      } else if (currentQuestion.question.toLowerCase().includes('vitals') || currentQuestion.question.toLowerCase().includes('lcp')) {
        sample = `Core Web Vitals gauge real-world UX: LCP tracks hero asset render speed, INP measures interaction responsiveness, and CLS monitors visual stability. In my project, I optimized LCP by code splitting heavy route bundles with React.lazy and preloading key hero assets. To prevent CLS, I set explicit aspect-ratio attributes on image wrappers and used fixed-height skeleton placeholders while async data was loading.`;
      } else {
        sample = `In React 18, automatic batching aggregates state updates across promises, setTimeout, and native event handlers, which previously caused multiple re-renders in React 17. For computationally intensive filtering, I use the useTransition hook to mark non-urgent state updates, allowing user keystrokes in input boxes to remain immediately responsive while the browser yields scheduler cycles back to the event loop.`;
      }
    } else if (currentQuestion.type === 'behavioural') {
      sample = `During my final-year placement portal project, our team had a disagreement on whether to build client-side or server-side pagination for 1,400+ student profiles. My teammate wanted client-side filtering for simplicity, but I was concerned about mobile memory constraints and slow initial payloads. 
Rather than arguing over opinions, I built a quick prototype benchmark measuring network transfer size: client-side downloaded 4.2 MB on initial load vs 120 KB per page for server-side pagination with indexing. Seeing the empirical 35x bandwidth savings, my teammate agreed, and we delivered the module 4 days ahead of our campus deadline.`;
    } else {
      sample = `In a production outage where users see endless loading spinners, my step-by-step triage is:
1. Immediate Mitigation: Check telemetry error rates. If user impact is high, execute an immediate rollback to the previous stable release while preserving staging for inspection.
2. Triage Telemetry: Inspect browser console logs for unhandled promise rejections, CORS blocks, or bundle chunk loading errors, while checking server logs for 500s or database connection pool starvation.
3. Network Inspection: Verify if the network request is stuck pending (backend timeout) or failing silently on the client due to a broken state transition.
4. Resolution & Prevention: Reproduce locally with identical payload, patch the root cause, and write an automated regression test before redeploying.`;
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: sample,
    }));
  };

  const handleCopyModelAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModelAnswer(true);
    setTimeout(() => setCopiedModelAnswer(false), 2000);
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (filter === 'technical') return q.type === 'technical';
    if (filter === 'behavioural') return q.type === 'behavioural';
    if (filter === 'scenario') return q.type === 'scenario';
    if (filter === 'gaps') return Boolean(q.targets_gap);
    return true;
  });

  // Calculate overall stats
  const answeredCount = Object.keys(evaluations).length;
  const evaluatedList = Object.values(evaluations);
  const avgCorrectness = evaluatedList.length > 0
    ? (evaluatedList.reduce((acc, ev) => acc + ev.scores.correctness, 0) / evaluatedList.length).toFixed(1)
    : null;
  const avgClarity = evaluatedList.length > 0
    ? (evaluatedList.reduce((acc, ev) => acc + ev.scores.clarity, 0) / evaluatedList.length).toFixed(1)
    : null;
  const avgCompleteness = evaluatedList.length > 0
    ? (evaluatedList.reduce((acc, ev) => acc + ev.scores.completeness, 0) / evaluatedList.length).toFixed(1)
    : null;

  const currentWordCount = countWords(currentAnswer);

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Screen 4
            </span>
            <span className="text-slate-400 text-xs">Interview Practice & Answer Evaluator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
            <span>Interview Practice</span>
            <span className="text-teal-400 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-teal-500/30">
              10 Role Questions
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounded in target JD requirements & candidate gaps. Features real-time answer scoring across Correctness, Clarity, and Completeness out of 5.
          </p>
        </div>

        {/* Level Selector & Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setLevel('fresher')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                level === 'fresher'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fresher (0-1 yrs)
            </button>
            <button
              onClick={() => setLevel('1-3 years')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                level === '1-3 years'
                  ? 'bg-teal-400 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Early Career (1-3 yrs)
            </button>
          </div>

          <button
            onClick={() => fetchQuestions(level)}
            disabled={isLoadingQuestions}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Regenerate questions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuestions ? 'animate-spin text-teal-400' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      {/* Stats & Progress Overview Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Questions Evaluated</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-baseline gap-1.5">
            <span>{answeredCount}</span>
            <span className="text-xs text-slate-500 font-normal">/ 10</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(answeredCount / 10) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Avg Correctness</div>
          <div className="text-2xl font-bold text-teal-300 mt-1 flex items-baseline gap-1">
            <span>{avgCorrectness ?? '--'}</span>
            <span className="text-xs text-slate-500 font-normal">/ 5</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Technical accuracy & mechanisms</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Avg Clarity</div>
          <div className="text-2xl font-bold text-sky-300 mt-1 flex items-baseline gap-1">
            <span>{avgClarity ?? '--'}</span>
            <span className="text-xs text-slate-500 font-normal">/ 5</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Articulation & structure</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-medium">Avg Completeness</div>
          <div className="text-2xl font-bold text-purple-300 mt-1 flex items-baseline gap-1">
            <span>{avgCompleteness ?? '--'}</span>
            <span className="text-xs text-slate-500 font-normal">/ 5</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-2">Key concepts & trade-offs addressed</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
          <span>Filter:</span>
        </span>

        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            filter === 'all'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          All (10)
        </button>

        <button
          onClick={() => setFilter('technical')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'technical'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-teal-400" />
          <span>Technical (6)</span>
        </button>

        <button
          onClick={() => setFilter('behavioural')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'behavioural'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span>Behavioural / STAR (2)</span>
        </button>

        <button
          onClick={() => setFilter('scenario')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'scenario'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
          <span>Scenario (2)</span>
        </button>

        <button
          onClick={() => setFilter('gaps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            filter === 'gaps'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Targets Candidate Gaps (3)</span>
        </button>
      </div>

      {/* Error Banner with Retry */}
      {questionsError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{questionsError}</span>
          </div>
          <button
            onClick={() => fetchQuestions(level)}
            className="px-3 py-1 rounded-lg bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Workspace Grid (Desktop: Left Nav List + Right Active Arena) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
            <span>Select Question to Answer</span>
            <span>{filteredQuestions.length} shown</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const isSelected = currentQuestion?.id === q.id;
              const hasEvaluation = Boolean(evaluations[q.id]);
              const hasDraft = Boolean(answers[q.id]?.trim());

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    const actualIdx = questions.findIndex((item) => item.id === q.id);
                    if (actualIdx !== -1) setSelectedQuestionIndex(actualIdx);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 shadow-sm shadow-teal-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          isSelected
                            ? 'bg-teal-400 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {q.id}
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide ${
                          q.type === 'technical'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : q.type === 'behavioural'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {q.type}
                      </span>

                      {q.targets_gap && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-0.5">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          <span>Gap</span>
                        </span>
                      )}
                    </div>

                    {/* Status Icon */}
                    <div className="shrink-0">
                      {hasEvaluation ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3 text-teal-400" />
                          <span>{evaluations[q.id].scores.correctness}/5</span>
                        </span>
                      ) : hasDraft ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" title="Draft typed" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-700 inline-block" title="Not attempted" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 font-medium line-clamp-2 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[200px] text-slate-400">
                      {q.related_requirement}
                    </span>
                    <span className="capitalize text-slate-400 shrink-0 font-mono">
                      {q.difficulty}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Question Workspace & Evaluator */}
        <div className="lg:col-span-8 space-y-6">
          {currentQuestion ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6">
              {/* Question Header Card */}
              <div className="space-y-3 pb-5 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-400 text-slate-950">
                      Question #{currentQuestion.id}
                    </span>

                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${
                        currentQuestion.type === 'technical'
                          ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                          : currentQuestion.type === 'behavioural'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {currentQuestion.type}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        currentQuestion.difficulty === 'easy'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : currentQuestion.difficulty === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {currentQuestion.difficulty} difficulty
                    </span>
                  </div>

                  {currentQuestion.targets_gap && (
                    <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Targets Candidate Gap</span>
                    </div>
                  )}
                </div>

                {/* Related Requirement Tag */}
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <span className="text-slate-400">Assesses Requirement:</span>
                  <span className="font-mono text-teal-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {currentQuestion.related_requirement}
                  </span>
                </div>

                {/* Prominent Question Prompt */}
                <h2 className="text-lg sm:text-xl font-bold text-white leading-snug tracking-tight pt-1">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Collapsible: What a Good Answer Covers */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <button
                  onClick={() => setShowCriteriaGuide(!showCriteriaGuide)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white cursor-pointer bg-slate-900/40"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>What a Strong Answer Covers (Interviewer Benchmark)</span>
                  </div>
                  {showCriteriaGuide ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {showCriteriaGuide && (
                  <div className="p-4 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                    {currentQuestion.what_a_good_answer_covers.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Candidate Answer Box */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <label className="font-semibold text-slate-200">Your Answer:</label>
                    <span className="text-slate-400 text-[11px]">
                      {currentWordCount} words · {currentAnswer.length} chars
                    </span>
                  </div>

                  {/* Practice Timer Controls & Quick Load */}
                  <div className="flex items-center gap-2">
                    {/* 2-minute stopwatch */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                      <Timer className="w-3.5 h-3.5 text-teal-400" />
                      <span>
                        {Math.floor(timerSeconds / 60)}:
                        {(timerSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="p-1 hover:text-teal-300 text-slate-400 cursor-pointer"
                        title={isTimerRunning ? 'Pause timer' : 'Start 2-min timer'}
                      >
                        {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={resetTimer}
                        className="p-1 hover:text-slate-200 text-slate-400 cursor-pointer"
                        title="Reset timer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={handleLoadSampleAnswer}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 transition-colors cursor-pointer"
                      title="Load sample response to test feedback evaluator"
                    >
                      Load Sample Answer
                    </button>
                  </div>
                </div>

                <textarea
                  value={currentAnswer}
                  onChange={(e) => {
                    const text = e.target.value;
                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: text,
                    }));
                  }}
                  rows={5}
                  placeholder="Structure your answer clearly:
1. Direct Mechanism / Core Technical Choice
2. Practical Implementation (Trade-offs, Edge Cases)
3. Outcome / Concrete Verification from your project..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition-all leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Rule: Be honest. Never invent metrics or technologies not in your resume.
                  </span>

                  <button
                    onClick={handleEvaluateCurrentAnswer}
                    disabled={isEvaluating || !currentAnswer.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                  >
                    {isEvaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Evaluating Answer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-slate-950" />
                        <span>Get Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Evaluation Error */}
              {evaluationError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                  <span>{evaluationError}</span>
                  <button
                    onClick={handleEvaluateCurrentAnswer}
                    className="px-2.5 py-1 rounded bg-rose-500 text-slate-950 font-bold hover:bg-rose-400 text-xs cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Evaluated Result Card */}
              {currentEvaluation && (
                <div className="space-y-5 pt-4 border-t border-slate-800 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-teal-400" />
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        AI Feedback & Assessment Scores
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Overall Score:{' '}
                      <strong className="text-teal-300 font-bold">
                        {(
                          (currentEvaluation.scores.correctness +
                            currentEvaluation.scores.clarity +
                            currentEvaluation.scores.completeness) /
                          3
                        ).toFixed(1)}
                        / 5
                      </strong>
                    </span>
                  </div>

                  {/* 3 Scores Meter Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Correctness */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Correctness</span>
                        <span className="font-bold text-teal-300 text-sm">
                          {currentEvaluation.scores.correctness} / 5
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-teal-400 h-full rounded-full"
                          style={{
                            width: `${(currentEvaluation.scores.correctness / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Accuracy of technical terminology & logic.
                      </p>
                    </div>

                    {/* Clarity */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Clarity</span>
                        <span className="font-bold text-sky-300 text-sm">
                          {currentEvaluation.scores.clarity} / 5
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-400 h-full rounded-full"
                          style={{
                            width: `${(currentEvaluation.scores.clarity / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Sentence structure & concise communication.
                      </p>
                    </div>

                    {/* Completeness */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Completeness</span>
                        <span className="font-bold text-purple-300 text-sm">
                          {currentEvaluation.scores.completeness} / 5
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-400 h-full rounded-full"
                          style={{
                            width: `${(currentEvaluation.scores.completeness / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Addressed edge cases & required concepts.
                      </p>
                    </div>
                  </div>

                  {/* What Was Good */}
                  {currentEvaluation.what_was_good?.length > 0 && (
                    <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 space-y-2">
                      <div className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>What Was Good</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {currentEvaluation.what_was_good.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-teal-400 font-bold">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Concepts */}
                  {currentEvaluation.missing_concepts?.length > 0 && (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Missing Concepts to Include</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {currentEvaluation.missing_concepts.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved Sample Answer Example */}
                  {currentEvaluation.improved_answer_example && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-teal-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                          <span>Improved Answer Example (Model Response)</span>
                        </span>
                        <button
                          onClick={() => handleCopyModelAnswer(currentEvaluation.improved_answer_example)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer transition-colors"
                        >
                          {copiedModelAnswer ? (
                            <>
                              <Check className="w-3 h-3 text-teal-400" />
                              <span className="text-teal-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-900/90 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap border border-slate-800/80">
                        {currentEvaluation.improved_answer_example}
                      </div>
                    </div>
                  )}

                  {/* One Golden Tip */}
                  {currentEvaluation.one_tip && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-indigo-300">
                          Key Takeaway for Indian Placement Rounds
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {currentEvaluation.one_tip}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Next Question Navigation */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        if (selectedQuestionIndex > 0) {
                          setSelectedQuestionIndex((prev) => prev - 1);
                        }
                      }}
                      disabled={selectedQuestionIndex === 0}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      ← Previous Question
                    </button>

                    <button
                      onClick={() => {
                        if (selectedQuestionIndex < questions.length - 1) {
                          setSelectedQuestionIndex((prev) => prev + 1);
                        }
                      }}
                      disabled={selectedQuestionIndex >= questions.length - 1}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Loading Interview Questions...</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Analyzing target role requirements and candidate gaps to assemble 10 practice questions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Screen Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        <button
          onClick={onBackToTailoring}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 3: Tailoring</span>
        </button>

        <button
          onClick={onBackToHome}
          className="text-xs text-slate-400 hover:text-teal-300 cursor-pointer transition-colors"
        >
          ← Return to Ingestion / Profiles
        </button>
      </div>
    </div>
  );
};
