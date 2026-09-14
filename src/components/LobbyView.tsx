'use client';

import React, { useState } from 'react';
import {
  Users, Crown, Shield, User, Share2, Check, Sparkles,
  ArrowRight, Plus, LogIn, Dice5, Clock, Globe, X
} from 'lucide-react';
import { GameTheme, Language, LobbyPlayer, PlayerRole, Team } from '../lib/types';
import { generateRandomName, setLocalNickname } from '../lib/lobbySync';

interface LobbyViewProps {
  roomId: string;
  seed: string;
  theme: GameTheme;
  language: Language;
  timerDuration: number;
  players: LobbyPlayer[];
  currentPlayerId: string;
  onUpdateNickname: (name: string) => void;
  onClaimSeat: (team: Team | 'spectator', role: PlayerRole) => void;
  onUpdateTheme: (theme: GameTheme) => void;
  onUpdateLanguage: (lang: Language) => void;
  onUpdateTimer: (duration: number) => void;
  onCreateRoom: (customRoomId: string) => void;
  onJoinRoom: (targetRoomId: string) => void;
  onStartGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomId,
  theme,
  language,
  timerDuration,
  players,
  currentPlayerId,
  onUpdateNickname,
  onClaimSeat,
  onUpdateTheme,
  onUpdateLanguage,
  onUpdateTimer,
  onCreateRoom,
  onJoinRoom,
  onStartGame,
}) => {
  const [copied, setCopied] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomInput, setNewRoomInput] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'join'>('create');

  const me = players.find((p) => p.id === currentPlayerId);
  const [nicknameInput, setNicknameInput] = useState(me?.name || '');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNicknameChange = (newName: string) => {
    setNicknameInput(newName);
    setLocalNickname(newName);
    onUpdateNickname(newName);
  };

  const handleRandomName = () => {
    const random = generateRandomName(theme);
    handleNicknameChange(random);
  };

  const handleRoomModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRoomInput.trim().toUpperCase();
    if (!clean) return;

    if (modalMode === 'create') {
      onCreateRoom(clean);
    } else {
      onJoinRoom(clean);
    }
    setShowRoomModal(false);
    setNewRoomInput('');
  };

  // Group players by seat
  const redSpymaster = players.find((p) => p.team === 'red' && p.role === 'spymaster');
  const redOperatives = players.filter((p) => p.team === 'red' && p.role === 'operative');

  const blueSpymaster = players.find((p) => p.team === 'blue' && p.role === 'spymaster');
  const blueOperatives = players.filter((p) => p.team === 'blue' && p.role === 'operative');

  const spectators = players.filter((p) => p.team === 'spectator');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Top Banner: Room & Player Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
        {/* Nickname Editor */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'fr' ? 'Votre Nom de Code / Pseudo' : 'Your Codename / Nickname'}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => handleNicknameChange(e.target.value)}
              placeholder={language === 'fr' ? 'Ex: Harry, Agent 007...' : 'Ex: Harry, Agent 007...'}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-400"
              maxLength={20}
            />
            <button
              onClick={handleRandomName}
              className="p-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              title={language === 'fr' ? 'Générer un pseudo aléatoire' : 'Randomize nickname'}
            >
              <Dice5 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[11px] text-zinc-400">
            {language === 'fr'
              ? 'Ce nom est visible par les autres joueurs dans le salon et dans le journal.'
              : 'This name appears to all players in the lobby and operation log.'}
          </p>
        </div>

        {/* Room Info & Join / Create */}
        <div className="flex flex-col gap-2 md:items-end justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 font-bold">
              {language === 'fr' ? 'SALLE :' : 'ROOM:'}
            </span>
            <span className="text-xl font-mono font-black text-amber-400 tracking-widest bg-zinc-950 px-3.5 py-1 rounded-xl border border-zinc-800">
              {roomId}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-mono cursor-pointer"
              title="Copier le lien"
            >
              {copied ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Copié' : 'Copied'}</span>
                </span>
              ) : (
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => {
                setModalMode('create');
                setShowRoomModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-mono transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'fr' ? 'Créer une Salle' : 'Create Room'}</span>
            </button>

            <button
              onClick={() => {
                setModalMode('join');
                setShowRoomModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-mono transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'fr' ? 'Rejoindre une Salle' : 'Join Room'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEAM ROSTERS (RED VS BLUE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* RED TEAM ROSTER */}
        <div className="bg-gradient-to-b from-red-950/40 via-zinc-900/90 to-zinc-900/90 border-2 border-red-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
                <h3 className="font-mono font-black text-lg text-red-400 uppercase tracking-wider">
                  {language === 'fr' ? 'ÉQUIPE ROUGE' : 'RED TEAM'}
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-red-950/60 px-2.5 py-1 rounded-full border border-red-800/40">
                {1 + redOperatives.length} {language === 'fr' ? 'joueurs' : 'players'}
              </span>
            </div>

            {/* Red Spymaster Seat */}
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fr' ? 'Maître-Espion (1 seul)' : 'Spymaster (1 seat)'}</span>
              </span>

              {redSpymaster ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-red-950/80 border border-red-500/60">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-sm text-white">
                      {redSpymaster.name}
                    </span>
                    {redSpymaster.id === currentPlayerId && (
                      <span className="text-[10px] bg-red-500 text-white font-mono px-2 py-0.5 rounded-full">
                        {language === 'fr' ? 'VOUS' : 'YOU'}
                      </span>
                    )}
                  </div>
                  {redSpymaster.id === currentPlayerId && (
                    <button
                      onClick={() => onClaimSeat('spectator', 'operative')}
                      className="text-xs text-red-300 hover:text-white underline font-mono cursor-pointer"
                    >
                      {language === 'fr' ? 'Quitter la place' : 'Leave'}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onClaimSeat('red', 'spymaster')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-dashed border-red-500/60 text-red-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{language === 'fr' ? 'Prendre la place de Maître-Espion Rouge' : 'Become Red Spymaster'}</span>
                </button>
              )}
            </div>

            {/* Red Operatives Pool */}
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span>{language === 'fr' ? 'Agents de Terrain' : 'Field Operatives'}</span>
              </span>

              <div className="space-y-1.5 mb-3">
                {redOperatives.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-mono italic py-2">
                    {language === 'fr' ? 'Aucun agent pour le moment.' : 'No operatives yet.'}
                  </p>
                ) : (
                  redOperatives.map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-red-400" />
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          {op.name}
                        </span>
                        {op.id === currentPlayerId && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-mono">
                            {language === 'fr' ? 'VOUS' : 'YOU'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Join as Operative Button */}
              {!(me?.team === 'red' && me?.role === 'operative') && (
                <button
                  onClick={() => onClaimSeat('red', 'operative')}
                  className="w-full py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Rejoindre comme Agent Rouge' : 'Join as Red Operative'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BLUE TEAM ROSTER */}
        <div className="bg-gradient-to-b from-blue-950/40 via-zinc-900/90 to-zinc-900/90 border-2 border-blue-500/50 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
                <h3 className="font-mono font-black text-lg text-blue-400 uppercase tracking-wider">
                  {language === 'fr' ? 'ÉQUIPE BLEUE' : 'BLUE TEAM'}
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/40">
                {1 + blueOperatives.length} {language === 'fr' ? 'joueurs' : 'players'}
              </span>
            </div>

            {/* Blue Spymaster Seat */}
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fr' ? 'Maître-Espion (1 seul)' : 'Spymaster (1 seat)'}</span>
              </span>

              {blueSpymaster ? (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-950/80 border border-blue-500/60">
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-mono font-bold text-sm text-white">
                      {blueSpymaster.name}
                    </span>
                    {blueSpymaster.id === currentPlayerId && (
                      <span className="text-[10px] bg-blue-500 text-white font-mono px-2 py-0.5 rounded-full">
                        {language === 'fr' ? 'VOUS' : 'YOU'}
                      </span>
                    )}
                  </div>
                  {blueSpymaster.id === currentPlayerId && (
                    <button
                      onClick={() => onClaimSeat('spectator', 'operative')}
                      className="text-xs text-blue-300 hover:text-white underline font-mono cursor-pointer"
                    >
                      {language === 'fr' ? 'Quitter la place' : 'Leave'}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onClaimSeat('blue', 'spymaster')}
                  className="w-full py-2.5 px-4 rounded-2xl bg-blue-950/40 hover:bg-blue-900/60 border border-dashed border-blue-500/60 text-blue-300 hover:text-white font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{language === 'fr' ? 'Prendre la place de Maître-Espion Bleu' : 'Become Blue Spymaster'}</span>
                </button>
              )}
            </div>

            {/* Blue Operatives Pool */}
            <div>
              <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'fr' ? 'Agents de Terrain' : 'Field Operatives'}</span>
              </span>

              <div className="space-y-1.5 mb-3">
                {blueOperatives.length === 0 ? (
                  <p className="text-xs text-zinc-400 font-mono italic py-2">
                    {language === 'fr' ? 'Aucun agent pour le moment.' : 'No operatives yet.'}
                  </p>
                ) : (
                  blueOperatives.map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-mono text-xs font-bold text-zinc-200">
                          {op.name}
                        </span>
                        {op.id === currentPlayerId && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/40 px-2 py-0.5 rounded-full font-mono">
                            {language === 'fr' ? 'VOUS' : 'YOU'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Join as Operative Button */}
              {!(me?.team === 'blue' && me?.role === 'operative') && (
                <button
                  onClick={() => onClaimSeat('blue', 'operative')}
                  className="w-full py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{language === 'fr' ? 'Rejoindre comme Agent Bleu' : 'Join as Blue Operative'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SPECTATORS & GAME CONFIGURATION BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spectators */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block mb-2">
              {language === 'fr' ? 'Spectateurs / En attente' : 'Spectators / Unassigned'}
            </span>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {spectators.length === 0 ? (
                <span className="text-xs text-zinc-400 font-mono italic">
                  {language === 'fr' ? 'Tous les joueurs sont en équipe.' : 'All players assigned.'}
                </span>
              ) : (
                spectators.map((s) => (
                  <span
                    key={s.id}
                    className="text-xs font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-300"
                  >
                    {s.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {me?.team !== 'spectator' && (
            <button
              onClick={() => onClaimSeat('spectator', 'operative')}
              className="text-xs font-mono text-zinc-400 hover:text-white underline text-left mt-2 cursor-pointer"
            >
              {language === 'fr' ? 'Passer en Spectateur' : 'Become Spectator'}
            </button>
          )}
        </div>

        {/* Theme & Language Selectors */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-2">
          <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
            {language === 'fr' ? 'Configuration de Partie' : 'Game Options'}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {/* Theme */}
            <button
              onClick={() => onUpdateTheme(theme === 'classic' ? 'harrypotter' : 'classic')}
              className={`p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                theme === 'harrypotter'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-zinc-950 border-zinc-700 text-zinc-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{theme === 'harrypotter' ? 'Harry Potter' : 'Classique'}</span>
            </button>

            {/* Language */}
            <button
              onClick={() => onUpdateLanguage(language === 'fr' ? 'en' : 'fr')}
              className="p-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 border border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{language.toUpperCase()}</span>
            </button>
          </div>

          {/* Timer duration */}
          <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-zinc-800">
            <span className="text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{language === 'fr' ? 'Chrono tour :' : 'Turn timer:'}</span>
            </span>
            <select
              value={timerDuration}
              onChange={(e) => onUpdateTimer(parseInt(e.target.value, 10))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-200 font-mono text-xs cursor-pointer focus:outline-none"
            >
              <option value={0}>{language === 'fr' ? 'Désactivé' : 'Off'}</option>
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>120s</option>
            </select>
          </div>
        </div>

        {/* Big Action: START / ENTER GAME */}
        <div className="bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            {language === 'fr' ? 'Prêt à jouer ?' : 'Ready to play?'}
          </span>
          <button
            onClick={onStartGame}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm font-mono uppercase tracking-wider shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <span>{language === 'fr' ? 'Lancer la Partie' : 'Launch Game'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-zinc-400 font-mono">
            {language === 'fr' ? 'Basculez sur la grille 5×5' : 'Enter the 5×5 grid'}
          </span>
        </div>
      </div>

      {/* CREATE / JOIN ROOM MODAL */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="font-mono font-bold text-base text-white uppercase">
                {modalMode === 'create'
                  ? language === 'fr' ? 'Créer une Salle' : 'Create Room'
                  : language === 'fr' ? 'Rejoindre une Salle' : 'Join Room'}
              </h3>
              <button
                onClick={() => setShowRoomModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRoomModalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase font-semibold block mb-1">
                  {modalMode === 'create'
                    ? language === 'fr' ? 'Code de la nouvelle salle' : 'New Room Code'
                    : language === 'fr' ? 'Code de la salle à rejoindre' : 'Room Code to Join'}
                </label>
                <input
                  type="text"
                  value={newRoomInput}
                  onChange={(e) => setNewRoomInput(e.target.value.replace(/\s+/g, '').toUpperCase())}
                  placeholder="Ex: HOGWARTS, ALPHA, SECRET..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-amber-400"
                  maxLength={15}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-mono text-xs font-bold uppercase shadow-md cursor-pointer"
                >
                  {modalMode === 'create'
                    ? language === 'fr' ? 'Créer' : 'Create'
                    : language === 'fr' ? 'Rejoindre' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
