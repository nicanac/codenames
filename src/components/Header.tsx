'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Share2, Check, RefreshCw, BookOpen, Globe } from 'lucide-react';
import { Language } from '../lib/types';
import { sounds } from '../lib/audio';

interface HeaderProps {
  roomId: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNewGame: () => void;
  onOpenRules: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  roomId,
  language,
  onLanguageChange,
  onNewGame,
  onOpenRules,
}) => {
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(sounds.getMuted());

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleSound = () => {
    const isNowMuted = sounds.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 text-white sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 via-zinc-800 to-blue-600 flex items-center justify-center font-black tracking-widest text-xs shadow-lg shadow-black/50 ring-1 ring-zinc-700">
            CN
          </div>
          <div>
            <h1 className="font-extrabold tracking-wider text-base sm:text-lg flex items-center gap-1.5 font-mono">
              <span className="text-red-500">CODE</span>
              <span className="text-zinc-200">NAMES</span>
              <span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wide hidden sm:block">
              {language === 'fr' ? 'Édition Espionnage Tactique' : 'Tactical Espionage Edition'}
            </p>
          </div>
        </div>

        {/* Room badge & Copy */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 text-xs">
          <span className="text-zinc-400 font-mono">
            {language === 'fr' ? 'SALLE' : 'ROOM'}:
          </span>
          <span className="font-mono font-bold tracking-widest text-amber-400">{roomId}</span>
          <button
            onClick={handleCopyLink}
            className="ml-1 text-zinc-400 hover:text-zinc-100 transition-colors flex items-center gap-1 focus:outline-none"
            title={language === 'fr' ? 'Copier le lien' : 'Copy game link'}
          >
            {copied ? (
              <span className="flex items-center text-emerald-400 text-[11px] font-sans font-medium">
                <Check className="w-3.5 h-3.5 mr-0.5" />
                {language === 'fr' ? 'Copié!' : 'Copied!'}
              </span>
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Actions & Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switch */}
          <button
            onClick={() => onLanguageChange(language === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 transition-colors"
            title={language === 'fr' ? 'Passer en Anglais' : 'Switch to French'}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold">{language.toUpperCase()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
            title={muted ? 'Activer le son' : 'Couper le son'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Rules Modal Button */}
          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors font-medium"
            title="Rules / Règles"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{language === 'fr' ? 'Règles' : 'Rules'}</span>
          </button>

          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Nouveau Jeu' : 'New Game'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
