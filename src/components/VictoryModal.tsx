'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Skull, ShieldCheck } from 'lucide-react';
import { GameState } from '../lib/types';
import { sounds } from '../lib/audio';

interface VictoryModalProps {
  gameState: GameState;
  onNewGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ gameState, onNewGame }) => {
  const { winner, winReason, language } = gameState;

  useEffect(() => {
    if (winner) {
      sounds.playVictory();

      // Confetti burst
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [winner]);

  if (!winner) return null;

  const isRed = winner === 'red';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Trophy icon */}
        <div
          className={`w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg ring-4 ${
            isRed
              ? 'bg-red-500/20 text-red-500 ring-red-500/30'
              : 'bg-blue-500/20 text-blue-500 ring-blue-500/30'
          }`}
        >
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider uppercase text-white mb-2">
          {isRed
            ? language === 'fr'
              ? 'VICTOIRE ROUGE !'
              : 'RED TEAM WINS!'
            : language === 'fr'
            ? 'VICTOIRE BLEUE !'
            : 'BLUE TEAM WINS!'}
        </h2>

        {/* Win reason */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-950 border border-zinc-800 text-xs font-mono mb-6">
          {winReason === 'assassin_hit' ? (
            <>
              <Skull className="w-3.5 h-3.5 text-red-500" />
              <span className="text-zinc-300">
                {language === 'fr'
                  ? "L'équipe adverse a touché l'Assassin !"
                  : 'Opponent contacted the Assassin!'}
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-zinc-300">
                {language === 'fr'
                  ? 'Tous les agents secrets ont été identifiés !'
                  : 'All secret operatives successfully found!'}
              </span>
            </>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={onNewGame}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider font-mono flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{language === 'fr' ? 'Lancer une nouvelle manche' : 'Start New Match'}</span>
        </button>
      </div>
    </div>
  );
};
