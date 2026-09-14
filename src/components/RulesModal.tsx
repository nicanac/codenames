'use client';

import React from 'react';
import { X, BookOpen, Shield, Skull, UserCheck } from 'lucide-react';
import { Language } from '../lib/types';

interface RulesModalProps {
  isOpen: boolean;
  language: Language;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, language, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">
              {language === 'fr' ? 'Règles du Jeu' : 'Game Rules'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
          <div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide mb-1">
              {language === 'fr' ? '1. Le But du Jeu' : '1. Objective'}
            </h3>
            <p>
              {language === 'fr'
                ? 'Deux équipes (Rouge et Bleue) s’affrontent. Chaque équipe possède un Maître-espion et des Agents de terrain. L’objectif est de contacter tous les agents secrets de votre couleur avant l’équipe adverse, sans jamais réveiller l’Assassin.'
                : 'Two rival spy networks (Red and Blue) compete. Each team has a Spymaster and Field Operatives. The goal is to contact all of your secret agents before the opposing team, while avoiding the deadly Assassin.'}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide mb-1">
              {language === 'fr' ? '2. Rôles' : '2. Roles'}
            </h3>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono shrink-0">
                  {language === 'fr' ? 'Maître-espion :' : 'Spymaster:'}
                </span>
                <span>
                  {language === 'fr'
                    ? 'Connaît la couleur secrète de chaque carte. Il donne un indice composé d’UN seul mot et d’un chiffre (ex: "OCÉAN 2").'
                    : 'Knows the secret identity of each card. Gives a clue of ONE word and a number (e.g. "OCEAN 2").'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-amber-400 font-mono shrink-0">
                  {language === 'fr' ? 'Agents de terrain :' : 'Operatives:'}
                </span>
                <span>
                  {language === 'fr'
                    ? 'Ne voient que les mots. Ils discutent et sélectionnent les cartes correspondantes.'
                    : 'Only see the words. They discuss and tap the cards that match the clue.'}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide mb-1">
              {language === 'fr' ? '3. Les Types de Cartes' : '3. Card Types'}
            </h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-2">
                <Shield className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-300 font-mono block">
                    {language === 'fr' ? 'Agent Rouge (8 ou 9)' : 'Red Agent (8 or 9)'}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {language === 'fr' ? 'Fait marquer Rouge.' : 'Scores for Red.'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-2">
                <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-300 font-mono block">
                    {language === 'fr' ? 'Agent Bleu (8 ou 9)' : 'Blue Agent (8 or 9)'}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {language === 'fr' ? 'Fait marquer Bleu.' : 'Scores for Blue.'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-start gap-2">
                <UserCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-300 font-mono block">
                    {language === 'fr' ? 'Témoin Neutre (7)' : 'Bystander (7)'}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {language === 'fr' ? 'Fin du tour immédiate.' : 'Ends turn immediately.'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-black border border-red-700/80 flex items-start gap-2">
                <Skull className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-red-400 font-mono block">
                    {language === 'fr' ? 'Assassin (1)' : 'Assassin (1)'}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    {language === 'fr' ? 'Défaite immédiate !' : 'Instant loss!'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wide mb-1">
              {language === 'fr' ? '4. Règle du bonus (+1 essai)' : '4. Guessing (+1 bonus rule)'}
            </h3>
            <p>
              {language === 'fr'
                ? "L'équipe peut faire autant de propositions que le chiffre annoncé, plus UNE tentative supplémentaire (pour rattraper un indice précédent). L'équipe peut s'arrêter à tout moment en cliquant sur « Terminer le tour »."
                : 'Your team may guess up to the announced number PLUS one bonus guess (to catch up on previous clues). You may end your turn at any time by pressing "End Turn".'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-500/30">
            <h3 className="font-bold text-xs text-amber-300 font-mono uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <span>⚡</span>
              <span>{language === 'fr' ? 'Édition Harry Potter' : 'Harry Potter Edition'}</span>
            </h3>
            <p className="text-[11px] text-zinc-300">
              {language === 'fr'
                ? "Chaque grille combine environ 18 concepts/objets magiques et 7 personnages emblématiques. Les noms propres sont autorisés comme indices (ex: 'Poudlard', 'Serpentard'), mais le Maître-espion ne peut pas utiliser le nom d'un personnage visible sur la grille."
                : "Each grid balances ~18 magical lore concepts with ~7 iconic characters. Proper nouns are legal clues by mutual agreement, but the Spymaster cannot cite the direct name of an unrevealed character on the board."}
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="pt-3 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider font-mono transition-colors cursor-pointer"
          >
            {language === 'fr' ? 'Compris !' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};
