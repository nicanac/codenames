'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert, Users } from 'lucide-react';
import { Language, PlayerRole } from '../lib/types';

interface RoleToggleProps {
  role: PlayerRole;
  language: Language;
  onRoleChange: (newRole: PlayerRole) => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({
  role,
  language,
  onRoleChange,
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
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex items-center shadow-md">
          {/* Operative Tab */}
          <button
            onClick={() => onRoleChange('operative')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'operative'
                ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Agent de Terrain' : 'Operative'}</span>
          </button>

          {/* Spymaster Tab */}
          <button
            onClick={role === 'spymaster' ? () => onRoleChange('operative') : handleSelectSpymaster}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              role === 'spymaster'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-amber-300'
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
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={confirmSpymaster}
                className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold transition-all shadow-md active:scale-95"
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
