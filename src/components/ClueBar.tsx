'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, ArrowRightCircle } from 'lucide-react';
import { GameState, PlayerRole } from '../lib/types';

interface ClueBarProps {
  gameState: GameState;
  role: PlayerRole;
  onGiveClue: (word: string, count: number) => { error?: string };
  onEndTurn: () => void;
}

export const ClueBar: React.FC<ClueBarProps> = ({
  gameState,
  role,
  onGiveClue,
  onEndTurn,
}) => {
  const { currentTeam, currentClue, language, winner } = gameState;
  const [clueWord, setClueWord] = useState('');
  const [clueCount, setClueCount] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (winner) return null;

  const handleSubmitClue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = onGiveClue(clueWord, clueCount);
    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setClueWord('');
      setClueCount(1);
    }
  };

  const teamColorBorder = currentTeam === 'red' ? 'border-red-500/50' : 'border-blue-500/50';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2">
      <div
        className={`bg-zinc-900/90 backdrop-blur-md rounded-2xl border ${teamColorBorder} p-3 sm:p-4 shadow-xl transition-all`}
      >
        {/* SPYMASTER VIEW */}
        {role === 'spymaster' && (
          <div>
            {!currentClue ? (
              <form onSubmit={handleSubmitClue} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center justify-between">
                    <span>
                      {language === 'fr' ? 'Donner un indice (1 seul mot)' : 'Provide a clue (1 single word)'}
                    </span>
                    <span className="text-amber-400">
                      {currentTeam === 'red' ? 'Équipe Rouge' : 'Équipe Bleue'}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={clueWord}
                    onChange={(e) => {
                      setErrorMessage(null);
                      setClueWord(e.target.value.replace(/\s+/g, ''));
                    }}
                    placeholder={language === 'fr' ? 'Ex: OCÉAN, ANIMAL, MÉTAL...' : 'Ex: OCEAN, ANIMAL, METAL...'}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 font-mono uppercase tracking-wider"
                    maxLength={30}
                    required
                  />
                </div>

                {/* Number selection */}
                <div className="w-full sm:w-auto flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold">
                    {language === 'fr' ? 'Nombre' : 'Count'}
                  </label>
                  <select
                    value={clueCount}
                    onChange={(e) => setClueCount(parseInt(e.target.value, 10))}
                    className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num}>
                        {num} {language === 'fr' ? 'cartes' : 'cards'}
                      </option>
                    ))}
                    <option value={0}>{language === 'fr' ? '0 (Zéro)' : '0 (Zero)'}</option>
                    <option value={-1}>{language === 'fr' ? '∞ (Illimité)' : '∞ (Unlimited)'}</option>
                  </select>
                </div>

                {/* Submit button */}
                <div className="w-full sm:w-auto sm:self-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs font-mono uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'fr' ? "Transmettre l'indice" : 'Give Clue'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-400">
                      {language === 'fr' ? 'Indice transmis aux agents :' : 'Clue given to field operatives:'}
                    </p>
                    <div className="flex items-center gap-2 font-mono mt-0.5">
                      <span className="text-lg font-black text-amber-300 tracking-wider">
                        {currentClue.word}
                      </span>
                      <span className="bg-zinc-800 text-zinc-200 text-xs px-2 py-0.5 rounded-md font-bold">
                        {currentClue.number <= 0 ? '∞' : currentClue.number}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-zinc-400 bg-zinc-950/60 px-3 py-1.5 rounded-xl border border-zinc-800">
                  {language === 'fr'
                    ? "Vos agents sont en train de deviner..."
                    : 'Your operatives are guessing...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* OPERATIVE VIEW */}
        {role === 'operative' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentClue ? (
              <>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3.5 h-3.5 rounded-full animate-ping ${
                      currentTeam === 'red' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                  />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                      {language === 'fr' ? 'INDICE EN COURS' : 'ACTIVE CLUE'}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-lg sm:text-xl font-black text-amber-300 tracking-wider">
                        {currentClue.word}
                      </span>
                      <span className="bg-zinc-800 text-zinc-200 text-xs px-2 py-0.5 rounded-md font-bold">
                        {currentClue.number <= 0 ? '∞' : currentClue.number}
                      </span>
                      <span className="text-xs text-emerald-400 ml-1">
                        ({currentClue.guessesRemaining >= 90
                          ? '∞'
                          : `${currentClue.guessesRemaining} ${language === 'fr' ? 'essais restants' : 'left'}`})
                      </span>
                    </div>
                  </div>
                </div>

                {/* End Turn button */}
                <button
                  onClick={onEndTurn}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold transition-all border border-zinc-700 active:scale-95"
                >
                  <ArrowRightCircle className="w-4 h-4 text-zinc-400" />
                  <span>{language === 'fr' ? 'Terminer le Tour / Passer' : 'End Turn / Pass'}</span>
                </button>
              </>
            ) : (
              <div className="w-full text-center py-1">
                <span className="text-xs font-mono text-zinc-400 animate-pulse">
                  {language === 'fr'
                    ? "⏳ En attente de l'indice de votre Maître-espion..."
                    : '⏳ Waiting for your Spymaster to give a clue...'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="mt-2 text-xs text-red-400 bg-red-950/50 border border-red-800/60 rounded-xl p-2.5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
