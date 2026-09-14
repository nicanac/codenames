'use client';

import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, Shield, Skull, UserCheck, MessageSquare } from 'lucide-react';
import { HistoryItem, Language } from '../lib/types';

interface HistoryDrawerProps {
  history: HistoryItem[];
  language: Language;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ history, language }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2">
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden shadow-md">
        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold uppercase tracking-wider">
              {language === 'fr' ? 'Journal des opérations' : 'Operations Log'}
            </span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-sans font-medium">
              {history.length} {language === 'fr' ? 'actions' : 'events'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-zinc-400">
            <span>{isOpen ? (language === 'fr' ? 'Masquer' : 'Hide') : (language === 'fr' ? 'Afficher' : 'Show')}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded History List */}
        {isOpen && (
          <div className="p-3 border-t border-zinc-800 max-h-56 overflow-y-auto space-y-2 font-mono text-xs">
            {history.map((item) => {
              const isRed = item.team === 'red';

              return (
                <div
                  key={item.id}
                  className="flex items-start gap-2.5 py-1.5 px-2 rounded-lg bg-zinc-950/60 border border-zinc-800/60"
                >
                  {/* Badge */}
                  <div className="mt-0.5">
                    {item.type === 'clue' && <MessageSquare className="w-3.5 h-3.5 text-amber-400" />}
                    {item.type === 'guess' && (
                      item.cardType === 'assassin' ? (
                        <Skull className="w-3.5 h-3.5 text-red-500" />
                      ) : item.cardType === 'neutral' ? (
                        <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Shield className={`w-3.5 h-3.5 ${item.cardType === 'red' ? 'text-red-400' : 'text-blue-400'}`} />
                      )
                    )}
                    {item.type === 'pass' && <span className="text-zinc-500">⏭️</span>}
                    {item.type === 'game_over' && <Skull className="w-3.5 h-3.5 text-red-500 animate-bounce" />}
                    {item.type === 'start' && <span className="text-emerald-400">🏁</span>}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          isRed ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {isRed ? 'ROUGE' : 'BLEU'}
                      </span>
                      <span className="text-zinc-300 leading-tight">{item.text}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-[10px] text-zinc-400 shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
