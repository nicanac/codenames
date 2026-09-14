'use client';

import React from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { GameState } from '../lib/types';

interface ScoreBoardProps {
  gameState: GameState;
  onTimerToggle: () => void;
  onTimerReset: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  gameState,
  onTimerToggle,
  onTimerReset,
}) => {
  const { currentTeam, redRemaining, blueRemaining, currentClue, timerSecondsLeft, isTimerRunning, language } = gameState;

  const isRedTurn = currentTeam === 'red';
  const isBlueTurn = currentTeam === 'blue';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isTimerCritical = timerSecondsLeft > 0 && timerSecondsLeft <= 15;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-3 sm:py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-center">
        {/* Red Team Banner */}
        <div
          className={`relative rounded-xl p-3 sm:p-4 border transition-all duration-300 flex items-center justify-between ${
            isRedTurn
              ? 'bg-gradient-to-r from-red-950/80 to-red-900/40 border-red-500 shadow-lg shadow-red-950/50 ring-2 ring-red-500/30'
              : 'bg-zinc-900/60 border-zinc-800 opacity-80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRedTurn ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
            <div>
              <span className="text-xs font-mono tracking-wider uppercase text-red-400 font-bold">
                {language === 'fr' ? 'ÉQUIPE ROUGE' : 'RED TEAM'}
              </span>
              <p className="text-xs text-zinc-400">
                {isRedTurn
                  ? language === 'fr'
                    ? 'À votre tour'
                    : 'Active turn'
                  : language === 'fr'
                  ? 'En attente'
                  : 'Waiting'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl sm:text-3xl font-black font-mono text-red-400">
              {redRemaining}
            </span>
            <span className="text-[10px] uppercase font-mono text-zinc-400">
              {language === 'fr' ? 'restants' : 'remaining'}
            </span>
          </div>
        </div>

        {/* Center: Turn Info & Timer */}
        <div className="flex flex-col items-center justify-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 shadow-inner">
          <div className="flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold font-mono tracking-wide uppercase shadow-sm ${
                isRedTurn
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              {isRedTurn
                ? language === 'fr'
                  ? 'Tour : Équipe Rouge'
                  : 'Turn: Red Team'
                : language === 'fr'
                ? 'Tour : Équipe Bleue'
                : 'Turn: Blue Team'}
            </div>
          </div>

          {/* Clue summary indicator if clue active */}
          {currentClue ? (
            <div className="text-center font-mono text-xs">
              <span className="text-zinc-400">{language === 'fr' ? 'INDICE : ' : 'CLUE: '}</span>
              <span className="font-extrabold text-amber-300 tracking-wider text-sm mr-1">
                {currentClue.word}
              </span>
              <span className="text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {currentClue.number <= 0 ? '∞' : currentClue.number}
              </span>
              <div className="text-[11px] text-emerald-400 mt-0.5">
                {currentClue.guessesRemaining >= 90
                  ? language === 'fr' ? 'Essais illimités' : 'Unlimited guesses'
                  : `${currentClue.guessesRemaining} ${language === 'fr' ? 'essais restants' : 'guesses left'}`}
              </div>
            </div>
          ) : (
            <span className="text-[11px] font-mono text-zinc-400 italic">
              {language === 'fr' ? "En attente de l'indice du Maître-espion..." : 'Waiting for Spymaster clue...'}
            </span>
          )}

          {/* Timer controls */}
          {gameState.timerDuration > 0 && (
            <div className="flex items-center gap-2 mt-1 pt-1 border-t border-zinc-800/80 w-full justify-center">
              <div
                className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded ${
                  isTimerCritical
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-zinc-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatTime(timerSecondsLeft)}</span>
              </div>
              <button
                onClick={onTimerToggle}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onTimerReset}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Blue Team Banner */}
        <div
          className={`relative rounded-xl p-3 sm:p-4 border transition-all duration-300 flex items-center justify-between ${
            isBlueTurn
              ? 'bg-gradient-to-l from-blue-950/80 to-blue-900/40 border-blue-500 shadow-lg shadow-blue-950/50 ring-2 ring-blue-500/30'
              : 'bg-zinc-900/60 border-zinc-800 opacity-80'
          }`}
        >
          <div className="flex flex-col items-start">
            <span className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
              {blueRemaining}
            </span>
            <span className="text-[10px] uppercase font-mono text-zinc-400">
              {language === 'fr' ? 'restants' : 'remaining'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <span className="text-xs font-mono tracking-wider uppercase text-blue-400 font-bold">
                {language === 'fr' ? 'ÉQUIPE BLEUE' : 'BLUE TEAM'}
              </span>
              <p className="text-xs text-zinc-400">
                {isBlueTurn
                  ? language === 'fr'
                    ? 'À votre tour'
                    : 'Active turn'
                  : language === 'fr'
                  ? 'En attente'
                  : 'Waiting'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isBlueTurn ? 'bg-blue-500 animate-pulse' : 'bg-zinc-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
