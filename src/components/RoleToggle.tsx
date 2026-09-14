'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Users, Shield, UserCheck } from 'lucide-react';
import { Language, PlayerRole, UserTeamChoice } from '../lib/types';

interface RoleToggleProps {
  role: PlayerRole;
  myTeam: UserTeamChoice;
  language: Language;
  onRoleChange: (newRole: PlayerRole) => void;
  onTeamChange: (newTeam: UserTeamChoice) => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  role,
  myTeam,
  language,
  onRoleChange,
  onTeamChange,
}) => {
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleSelectSpymaster = () => {
    if (role === 'operative') {
      setShowWarningModal(true);
    }
  };

  const confirmSpymaster = () => {
    setShowWarningModal(false);
    onRoleChange('spymaster');
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto px-4 py-2 flex flex-col items-center gap-2.5">
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 shadow-md">
          {/* TEAM SELECTOR */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400 font-bold px-2 hidden sm:inline">
              {language === 'fr' ? 'ÉQUIPE :' : 'TEAM:'}
            </span>

            {/* Red Team */}
            <button
              onClick={() => onTeamChange('red')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                myTeam === 'red'
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/60 ring-1 ring-red-400'
                  : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Rouge' : 'Red'}</span>
            </button>

            {/* Pass & Play / Both */}
            <button
              onClick={() => onTeamChange('both')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                myTeam === 'both'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
              title={language === 'fr' ? 'Jouer les deux équipes sur le même écran' : 'Play both teams on single device'}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Libre / 2 Équipes' : 'Pass & Play'}</span>
            </button>

            {/* Blue Team */}
            <button
              onClick={() => onTeamChange('blue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                myTeam === 'blue'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-950/60 ring-1 ring-blue-400'
                  : 'text-zinc-400 hover:text-blue-400 hover:bg-zinc-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Bleu' : 'Blue'}</span>
            </button>
          </div>

          {/* ROLE SELECTOR */}
          <div className="flex items-center gap-1.5 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400 font-bold px-2 hidden sm:inline">
              {language === 'fr' ? 'RÔLE :' : 'ROLE:'}
            </span>

            {/* Operative */}
            <button
              onClick={() => onRoleChange('operative')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                role === 'operative'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'Agent' : 'Operative'}</span>
            </button>

            {/* Spymaster */}
            <button
              onClick={role === 'spymaster' ? () => onRoleChange('operative') : handleSelectSpymaster}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                role === 'spymaster'
                  ? 'bg-amber-400 text-zinc-950 shadow-md ring-1 ring-amber-300'
                  : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
              }`}
            >
              {role === 'spymaster' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{language === 'fr' ? 'Maître-Espion' : 'Spymaster'}</span>
              {role === 'spymaster' && (
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Current status pill */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 bg-zinc-950/70 border border-zinc-800/80 px-3.5 py-1 rounded-full shadow-sm">
          <span>{language === 'fr' ? 'Votre sélection :' : 'Your setup:'}</span>
          <span
            className={`font-bold uppercase ${
              myTeam === 'red'
                ? 'text-red-400'
                : myTeam === 'blue'
                ? 'text-blue-400'
                : 'text-zinc-300'
            }`}
          >
            {myTeam === 'red'
              ? language === 'fr' ? 'Équipe Rouge' : 'Red Team'
              : myTeam === 'blue'
              ? language === 'fr' ? 'Équipe Bleue' : 'Blue Team'
              : language === 'fr' ? 'Les 2 Équipes (Mode Libre)' : 'Both Teams (Free Mode)'}
          </span>
          <span>•</span>
          <span className="font-bold text-amber-300 uppercase">
            {role === 'spymaster'
              ? language === 'fr' ? 'Maître-Espion (Cartes Révélées)' : 'Spymaster (Keycards Shown)'
              : language === 'fr' ? 'Agent de Terrain' : 'Field Operative'}
          </span>
        </div>
      </div>

      {/* Warning confirmation before revealing Spymaster view */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-amber-500/50 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-center font-black text-lg text-white font-mono tracking-wide">
              {language === 'fr' ? 'ACCÈS CONFIDENTIEL' : 'TOP SECRET ACCESS'}
            </h3>
            <p className="text-xs text-zinc-300 text-center mt-2 leading-relaxed">
              {language === 'fr'
                ? 'Cette vue révèle l’identité secrète de toutes les cartes (agents rouges, bleus, témoins et assassin). Ne regardez que si vous êtes le Maître-espion de votre équipe !'
                : 'This view reveals the secret identity of all cards (red, blue, bystanders, and the assassin). Only proceed if you are the designated Spymaster!'}
            </p>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={confirmSpymaster}
                className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {language === 'fr' ? 'Je suis Maître-espion' : "I'm the Spymaster"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
