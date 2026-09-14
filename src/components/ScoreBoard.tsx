'use client';

import React from 'react';
import { Clock, Play, Pause, RotateCcw, UserPlus, Check } from 'lucide-react';
import { GameState, UserTeamChoice } from '../lib/types';

interface ScoreBoardProps {
  gameState: GameState;
  myTeam: UserTeamChoice;
  onTimerToggle: () => void;
  onTimerReset: () => void;
  onJoinTeam: (team: UserTeamChoice) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  gameState,
  myTeam,
  onTimerToggle,
  onTimerReset,
  onJoinTeam,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
        {/* Red Team Banner */}
        <div
          className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 flex flex-col justify-between ${
            isRedTurn
              ? 'bg-gradient-to-r from-red-950/90 to-red-900/50 border-red-500 shadow-xl shadow-red-950/60 ring-2 ring-red-500/40'
              : 'bg-zinc-900/70 border-zinc-800/80 opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-3.5 h-3.5 rounded-full ${isRedTurn ? 'bg-red-500 animate-pulse shadow-md shadow-red-500/50' : 'bg-zinc-600'}`} />
              <div>
                <span className="text-xs font-mono tracking-wider uppercase text-red-400 font-extrabold">
                  {language === 'fr' ? 'ÉQUIPE ROUGE' : 'RED TEAM'}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {isRedTurn
                    ? language === 'fr'
                      ? 'À votre tour de jouer'
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
              <span className="text-[9px] uppercase font-mono text-zinc-400">
                {language === 'fr' ? 'restants' : 'remaining'}
              </span>
            </div>
          </div>

          {/* Join Red Button */}
          <div className="mt-3 pt-2.5 border-t border-red-500/20 flex items-center justify-between">
            <button
              onClick={() => onJoinTeam(myTeam === 'red' ? 'both' : 'red')}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                myTeam === 'red'
                  ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400/50'
                  : 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/60'
              }`}
            >
              {myTeam === 'red' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Mon Équipe (Rouge)' : 'My Team (Red)'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Rejoindre Équipe Rouge' : 'Join Red Team'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Center: Turn Info & Timer */}
        <div className="flex flex-col items-center justify-between gap-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-inner">
          <div className="flex items-center gap-2">
            <div
              className={`px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide uppercase shadow-sm ${
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
            <div className="text-center font-mono text-xs my-1">
              <span className="text-zinc-400">{language === 'fr' ? 'INDICE : ' : 'CLUE: '}</span>
              <span className="font-extrabold text-amber-300 tracking-wider text-base mr-1">
                {currentClue.word}
              </span>
              <span className="text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded text-xs font-bold">
                {currentClue.number <= 0 ? '∞' : currentClue.number}
              </span>
              <div className="text-[11px] text-emerald-400 mt-1 font-semibold">
                {currentClue.guessesRemaining >= 90
                  ? language === 'fr' ? 'Essais illimités' : 'Unlimited guesses'
                  : `${currentClue.guessesRemaining} ${language === 'fr' ? 'essais restants' : 'guesses left'}`}
              </div>
            </div>
          ) : (
            <span className="text-xs font-mono text-zinc-400 italic my-1 text-center">
              {language === 'fr' ? "En attente de l'indice du Maître-espion..." : 'Waiting for Spymaster clue...'}
            </span>
          )}

          {/* Timer controls */}
          {gameState.timerDuration > 0 && (
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/80 w-full justify-center">
              <div
                className={`flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${
                  isTimerCritical
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-zinc-300 bg-zinc-950/60 border border-zinc-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{formatTime(timerSecondsLeft)}</span>
              </div>
              <button
                onClick={onTimerToggle}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isTimerRunning ? 'Pause' : 'Start'}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onTimerReset}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Blue Team Banner */}
        <div
          className={`relative rounded-2xl p-3.5 sm:p-4 border transition-all duration-300 flex flex-col justify-between ${
            isBlueTurn
              ? 'bg-gradient-to-l from-blue-950/90 to-blue-900/50 border-blue-500 shadow-xl shadow-blue-950/60 ring-2 ring-blue-500/40'
              : 'bg-zinc-900/70 border-zinc-800/80 opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
                {blueRemaining}
              </span>
              <span className="text-[9px] uppercase font-mono text-zinc-400">
                {language === 'fr' ? 'restants' : 'remaining'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-right">
              <div>
                <span className="text-xs font-mono tracking-wider uppercase text-blue-400 font-extrabold">
                  {language === 'fr' ? 'ÉQUIPE BLEUE' : 'BLUE TEAM'}
                </span>
                <p className="text-[11px] text-zinc-400">
                  {isBlueTurn
                    ? language === 'fr'
                      ? 'À votre tour de jouer'
                      : 'Active turn'
                    : language === 'fr'
                    ? 'En attente'
                    : 'Waiting'}
                </p>
              </div>
              <div className={`w-3.5 h-3.5 rounded-full ${isBlueTurn ? 'bg-blue-500 animate-pulse shadow-md shadow-blue-500/50' : 'bg-zinc-600'}`} />
            </div>
          </div>

          {/* Join Blue Button */}
          <div className="mt-3 pt-2.5 border-t border-blue-500/20 flex items-center justify-between">
            <button
              onClick={() => onJoinTeam(myTeam === 'blue' ? 'both' : 'blue')}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                myTeam === 'blue'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                  : 'bg-blue-950/60 hover:bg-blue-900 text-blue-300 border border-blue-700/60'
              }`}
            >
              {myTeam === 'blue' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Mon Équipe (Bleu)' : 'My Team (Blue)'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Rejoindre Équipe Bleue' : 'Join Blue Team'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
