/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  HelpCircle,
  Award,
  ShieldCheck,
  RefreshCw,
  Send,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface InterviewCoachProps {
  resumeText: string;
  jobDescriptionText: string;
}

export const InterviewCoach: React.FC<InterviewCoachProps> = ({
  resumeText,
  jobDescriptionText,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'PROJECT_DEEP_DIVE' | 'TECHNICAL_CORE' | 'HR_BEHAVIORAL'>('ALL');
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  const handleGenerateQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch('/api/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescriptionText,
          roleContext: 'Indian Tech Placement Interview',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate interview prep');
      const data = await response.json();
      setQuestions(data.questions || []);
      if (data.questions?.length > 0) {
        setSelectedQuestion(data.questions[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;
    setIsEvaluating(true);

    try {
      const response = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: selectedQuestion.question,
          candidateAnswer: userAnswer,
          resumeText,
        }),
      });

      if (!response.ok) throw new Error('Failed to evaluate answer');
      const data = await response.json();
      setEvaluationResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLoadSampleAnswer = () => {
    if (!selectedQuestion) return;
    if (selectedQuestion.category === 'PROJECT_DEEP_DIVE') {
      setUserAnswer(
        'In my CampusPlacement portal, I needed to authenticate 1,400+ students and recruiters securely. I implemented JWT with HTTP-only cookies on our Express backend to mitigate XSS risks, and built an Axios interceptor on the React frontend to refresh expired tokens and redirect cleanly.'
      );
    } else if (selectedQuestion.category === 'HR_BEHAVIORAL') {
      setUserAnswer(
        'During my internship at QuickByte, our team had a tight deadline to release merchant dashboards. I took ownership of integrating the 14 REST API endpoints with Redux Toolkit and coordinated daily with the backend engineer, delivering the module 3 days ahead of sprint completion.'
      );
    } else {
      setUserAnswer(
        'React 18 introduces concurrent rendering via the createRoot API. Key benefits include automatic batching for state updates across promises and setTimeout, and transition APIs like useTransition to prioritize immediate user typing over heavy background re-renders.'
      );
    }
  };

  const filteredQuestions = (questions || []).filter((q) => {
    if (categoryFilter === 'ALL') return true;
    return q.category === categoryFilter;
  });

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white tracking-tight">
                Resume-Grounded Interview Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Generates rigorous technical, architectural, and Indian campus HR questions referencing your actual resume projects. Practice real answers and receive honesty audits.
            </p>
          </div>

          <button
            onClick={handleGenerateQuestions}
            disabled={isLoadingQuestions}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
          >
            {isLoadingQuestions ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>{questions ? 'Regenerate Questions' : 'Generate Question Bank'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      {questions && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question List (Left Column) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('ALL')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === 'ALL'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setCategoryFilter('PROJECT_DEEP_DIVE')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === 'PROJECT_DEEP_DIVE'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Project Deep-Dive
              </button>
              <button
                onClick={() => setCategoryFilter('TECHNICAL_CORE')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === 'TECHNICAL_CORE'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Core Tech
              </button>
              <button
                onClick={() => setCategoryFilter('HR_BEHAVIORAL')}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors ${
                  categoryFilter === 'HR_BEHAVIORAL'
                    ? 'bg-slate-800 text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Indian HR
              </button>
            </div>

            {/* Questions stack */}
            <div className="space-y-2.5">
              {filteredQuestions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestion(q);
                      setEvaluationResult(null);
                      setUserAnswer('');
                    }}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-500 bg-slate-900 ring-1 ring-cyan-500/20'
                        : 'border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-semibold uppercase tracking-wider text-cyan-400">
                        {q.category.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500 font-mono">#{q.id}</span>
                    </div>

                    <h4 className="text-xs font-medium text-white line-clamp-2 leading-relaxed">
                      {q.question}
                    </h4>

                    <div className="mt-2 text-[11px] text-slate-400 line-clamp-1 italic">
                      Trigger: "{q.resumeTriggerSnippet}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Answer & Evaluation (Right Column) */}
          <div className="lg:col-span-7 space-y-5">
            {selectedQuestion && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
                {/* Active Question Details */}
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                    {selectedQuestion.category.replace('_', ' ')}
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    {selectedQuestion.question}
                  </h3>

                  {/* Resume Trigger Snippet */}
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
                    <span className="text-slate-500 font-sans font-semibold">Resume Evidence: </span>
                    "{selectedQuestion.resumeTriggerSnippet}"
                  </div>
                </div>

                {/* Intent & Pitfalls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <div className="font-semibold text-slate-300 mb-1">What the Interviewer Tests:</div>
                    <p className="text-slate-400 leading-relaxed">{selectedQuestion.interviewerIntent}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                    <div className="font-semibold text-amber-300 mb-1">Common Fresher Pitfalls:</div>
                    <p className="text-slate-400 leading-relaxed">{selectedQuestion.commonPitfalls}</p>
                  </div>
                </div>

                {/* Recommended Framework */}
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300">
                  <div className="font-semibold text-cyan-300 mb-1">Recommended Response Framework:</div>
                  <p className="leading-relaxed">{selectedQuestion.answerFramework}</p>
                </div>

                {/* Candidate Practice Area */}
                <div className="pt-2 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-white">Your Answer Draft</label>
                    <button
                      onClick={handleLoadSampleAnswer}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                    >
                      Fill Sample Draft
                    </button>
                  </div>

                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your spoken interview response here (or click Fill Sample Draft to test evaluation)..."
                    className="w-full h-32 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !userAnswer.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                          <span>Auditing Answer...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-slate-900" />
                          <span>Evaluate Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Evaluation Feedback Panel */}
                {evaluationResult && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5 mt-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold text-white">AI Interviewer Evaluation</h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-400">STAR Score:</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm tabular-nums">
                          {evaluationResult.starStructureScore}/10
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-white">Impression: </span>
                      {evaluationResult.overallImpression}
                    </div>

                    {/* Resume Truthfulness Check */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Resume Truthfulness & Grounding Check:</span>
                      </div>
                      <p className="text-slate-400">{evaluationResult.resumeTruthfulnessAudit}</p>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Strengths:</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {(evaluationResult.strengths || []).map((s: string, idx: number) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Areas to Sharpen:</span>
                        </div>
                        <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                          {(evaluationResult.areasToImprove || []).map((a: string, idx: number) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Model Answer Grounded in Resume */}
                    <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-cyan-300">
                        Exemplary Response (Grounded in Your Real Resume):
                      </div>
                      <p className="text-slate-200 leading-relaxed italic">
                        "{evaluationResult.modelAnswer}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
