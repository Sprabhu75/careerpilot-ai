/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, Sparkles, ShieldCheck, FileText, CheckCircle2, Sliders, Briefcase, Trash2 } from 'lucide-react';

export type AppScreen = 'home' | 'match_report' | 'tailoring' | 'interview_practice' | 'application_tracker';

interface HeaderProps {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  hasAnalyzed: boolean;
  onResetToDemo: () => void;
  onDeleteData?: () => void;
  trackerCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setCurrentScreen,
  hasAnalyzed,
  onResetToDemo,
  onDeleteData,
  trackerCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/src/assets/images/career_pilot_badge_1793291080097.jpg"
              alt="CareerPilot AI"
              className="w-9 h-9 rounded-xl object-cover border border-teal-500/30 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <button
              onClick={() => setCurrentScreen('home')}
              className="text-left cursor-pointer group focus:outline-none"
            >
              <div className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-1.5">
                CareerPilot<span className="text-teal-400">AI</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Placement & Resume Assistant for India
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Steps for Screens 1 to 5 */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium overflow-x-auto py-1">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'home'
                  ? 'bg-slate-800 text-teal-400 font-semibold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>Home</span>
            </button>

            <button
              onClick={() => setCurrentScreen('match_report')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'match_report'
                  ? 'bg-slate-800 text-teal-400 font-semibold shadow-xs border border-slate-700'
                  : hasAnalyzed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span>Match Report</span>
            </button>

            <button
              onClick={() => setCurrentScreen('tailoring')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'tailoring'
                  ? 'bg-slate-800 text-teal-400 font-semibold shadow-xs border border-slate-700'
                  : hasAnalyzed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                3
              </span>
              <span>Tailoring</span>
            </button>

            <button
              onClick={() => setCurrentScreen('interview_practice')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'interview_practice'
                  ? 'bg-slate-800 text-teal-400 font-semibold shadow-xs border border-slate-700'
                  : hasAnalyzed
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                4
              </span>
              <span>Interview</span>
            </button>

            <button
              onClick={() => setCurrentScreen('application_tracker')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                currentScreen === 'application_tracker'
                  ? 'bg-slate-800 text-teal-400 font-semibold shadow-xs border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold">
                5
              </span>
              <span>Tracker</span>
              {trackerCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60">
                  {trackerCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onDeleteData && (
              <button
                onClick={onDeleteData}
                title="Delete my data (Purge session and stored applications)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Delete my data</span>
              </button>
            )}

            <button
              onClick={onResetToDemo}
              title="Reset to realistic Indian fresher profile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-teal-300 rounded-lg border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
