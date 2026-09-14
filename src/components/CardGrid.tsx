'use client';

import React, { useState } from 'react';
import { Shield, Skull, UserCheck, HelpCircle, Check, X } from 'lucide-react';
import { GameCard, GameState, PlayerRole } from '../lib/types';

interface CardGridProps {
  gameState: GameState;
  role: PlayerRole;
  onCardClick: (cardId: number) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({
  gameState,
  role,
  onCardClick,
}) => {
  const { cards, winner, currentTeam, language } = gameState;
  const [confirmCard, setConfirmCard] = useState<GameCard | null>(null);

  const handleCardSelect = (card: GameCard) => {
    if (card.revealed || winner) return;

    // Trigger confirmation modal for operatives to avoid misclicks
    if (role === 'operative') {
      setConfirmCard(card);
    } else {
      // Spymaster can click directly (e.g. In pass & play mode)
      onCardClick(card.id);
    }
  };

  const handleConfirmGuess = () => {
    if (confirmCard) {
      onCardClick(confirmCard.id);
      setConfirmCard(null);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-3">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {cards.map((card) => {
            const isRevealed = card.revealed;
            const isSpymaster = role === 'spymaster';

            // Base styling for revealed cards
            if (isRevealed) {
              return (
                <div
                  key={card.id}
                  className={`relative aspect-[5/3] sm:aspect-[4/3] md:aspect-[7/4] rounded-xl flex flex-col items-center justify-center p-2 sm:p-3 text-center transition-all duration-300 shadow-inner select-none overflow-hidden ${
                    card.type === 'red'
                      ? 'bg-gradient-to-br from-red-700 to-red-950 border border-red-500/80 text-white'
                      : card.type === 'blue'
                      ? 'bg-gradient-to-br from-blue-700 to-blue-950 border border-blue-500/80 text-white'
                      : card.type === 'assassin'
                      ? 'bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border border-zinc-700 text-zinc-300 ring-2 ring-red-600/40'
                      : 'bg-zinc-800/90 border border-zinc-700/60 text-zinc-400'
                  }`}
                >
                  {/* Watermark / Badge */}
                  <div className="absolute top-1.5 right-1.5 opacity-30">
                    {card.type === 'red' && <Shield className="w-3.5 h-3.5 text-red-300" />}
                    {card.type === 'blue' && <Shield className="w-3.5 h-3.5 text-blue-300" />}
                    {card.type === 'assassin' && <Skull className="w-4 h-4 text-red-500" />}
                    {card.type === 'neutral' && <UserCheck className="w-3.5 h-3.5 text-zinc-400" />}
                  </div>

                  {/* Icon on revealed card */}
                  <div className="mb-0.5 sm:mb-1">
                    {card.type === 'red' && <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-300" />}
                    {card.type === 'blue' && <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-300" />}
                    {card.type === 'assassin' && <Skull className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-pulse" />}
                    {card.type === 'neutral' && <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />}
                  </div>

                  {/* Word */}
                  <span className="font-mono font-bold text-[10px] sm:text-xs md:text-sm tracking-wider uppercase line-through opacity-80 break-all px-1">
                    {card.word}
                  </span>
                </div>
              );
            }

            // UNREVEALED CARD (in Spymaster mode vs Operative mode)
            if (isSpymaster) {
              // Spymaster sees secret identity
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardSelect(card)}
                  className={`relative aspect-[5/3] sm:aspect-[4/3] md:aspect-[7/4] rounded-xl flex flex-col items-center justify-center p-2 sm:p-3 text-center transition-all duration-200 border-2 select-none shadow-md hover:scale-[1.02] cursor-pointer ${
                    card.type === 'red'
                      ? 'bg-red-950/70 border-red-500/80 text-red-100 hover:bg-red-900/80 shadow-red-950/40'
                      : card.type === 'blue'
                      ? 'bg-blue-950/70 border-blue-500/80 text-blue-100 hover:bg-blue-900/80 shadow-blue-950/40'
                      : card.type === 'assassin'
                      ? 'bg-zinc-950 border-red-500/90 text-zinc-200 ring-2 ring-red-500/50 hover:bg-black shadow-red-950/60'
                      : 'bg-zinc-900/90 border-amber-800/40 text-amber-200/70 hover:bg-zinc-800/90'
                  }`}
                >
                  {/* Badge */}
                  <div className="absolute top-1.5 right-1.5 flex items-center">
                    {card.type === 'red' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
                    )}
                    {card.type === 'blue' && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" />
                    )}
                    {card.type === 'assassin' && (
                      <Skull className="w-3.5 h-3.5 text-red-500" />
                    )}
                    {card.type === 'neutral' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
                    )}
                  </div>

                  <span className="font-mono font-extrabold text-[11px] sm:text-xs md:text-sm tracking-wide uppercase break-words px-1">
                    {card.word}
                  </span>
                </button>
              );
            }

            // Operative sees unrevealed standard card
            return (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                className="group relative aspect-[5/3] sm:aspect-[4/3] md:aspect-[7/4] rounded-xl flex flex-col items-center justify-center p-2 sm:p-3 text-center transition-all duration-200 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300 dark:border-zinc-700/80 shadow-md hover:shadow-xl hover:scale-[1.03] active:scale-95 cursor-pointer select-none"
              >
                {/* Decorative border lines */}
                <div className="absolute inset-1 rounded-lg border border-zinc-400/30 dark:border-zinc-700/40 pointer-events-none" />

                <span className="font-mono font-black text-[11px] sm:text-xs md:text-sm tracking-wider uppercase text-zinc-800 dark:text-zinc-100 group-hover:text-amber-500 transition-colors break-words px-1">
                  {card.word}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal for Operative Guess */}
      {confirmCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <HelpCircle className="w-5 h-5" />
            </div>

            <h3 className="text-center font-bold text-base text-zinc-300">
              {language === 'fr' ? 'Confirmer le choix ?' : 'Confirm your guess?'}
            </h3>

            <div className="text-center my-4 py-3 bg-zinc-950 rounded-xl border border-zinc-800">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-amber-300 uppercase">
                {confirmCard.word}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 text-center mb-5">
              {language === 'fr'
                ? `Vous jouez pour l'${currentTeam === 'red' ? 'Équipe Rouge' : 'Équipe Bleue'}. Cette action est irréversible.`
                : `Playing for ${currentTeam === 'red' ? 'Red Team' : 'Blue Team'}. This action cannot be undone.`}
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmCard(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{language === 'fr' ? 'Annuler' : 'Cancel'}</span>
              </button>
              <button
                onClick={handleConfirmGuess}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'fr' ? 'Révéler' : 'Reveal'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
