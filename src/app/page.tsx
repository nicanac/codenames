'use client';

import React, { useState, useEffect } from 'react';
import { GameState, Language, PlayerRole } from '../lib/types';
import { createGame, giveClue, makeGuess, endTurn, generateSeed, generateRoomId } from '../lib/engine';
import { sounds } from '../lib/audio';
import { Header } from '../components/Header';
import { ScoreBoard } from '../components/ScoreBoard';
import { RoleToggle } from '../components/RoleToggle';
import { ClueBar } from '../components/ClueBar';
import { CardGrid } from '../components/CardGrid';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { VictoryModal } from '../components/VictoryModal';
import { RulesModal } from '../components/RulesModal';

function getInitialGameState(): GameState {
  let initialRoom = generateRoomId();
  let initialSeed = generateSeed();
  let initialLang: Language = 'fr';

  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);

    const hashRoom = params.get('room');
    const hashSeed = params.get('seed');
    const hashLang = params.get('lang') as Language;

    if (hashRoom) initialRoom = hashRoom;
    if (hashSeed) initialSeed = hashSeed;
    if (hashLang === 'en' || hashLang === 'fr') initialLang = hashLang;
  }

  return createGame({
    roomId: initialRoom,
    seed: initialSeed,
    language: initialLang,
  });
}

export default function CodenamesApp() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [role, setRole] = useState<PlayerRole>('operative');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sync state to URL hash
  const updateUrlHash = (room: string, seed: string, lang: Language) => {
    if (typeof window !== 'undefined') {
      const newHash = `room=${room}&seed=${seed}&lang=${lang}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState(null, '', `#${newHash}`);
      }
    }
  };

  // Sync hash whenever room, seed, or language changes
  useEffect(() => {
    updateUrlHash(gameState.roomId, gameState.seed, gameState.language);
  }, [gameState.roomId, gameState.seed, gameState.language]);

  // Timer Tick Effect
  const isTimerRunning = gameState.isTimerRunning;
  const winner = gameState.winner;
  const timerDuration = gameState.timerDuration;

  useEffect(() => {
    if (!isTimerRunning || winner || timerDuration <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (!prev.isTimerRunning || prev.winner) return prev;

        const nextSeconds = prev.timerSecondsLeft - 1;

        if (nextSeconds <= 10 && nextSeconds > 0) {
          sounds.playTick();
        }

        if (nextSeconds <= 0) {
          // Timer expired: automatically switch turn!
          sounds.playNeutral();
          return endTurn(prev);
        }

        return {
          ...prev,
          timerSecondsLeft: nextSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, winner, timerDuration]);

  // Handle Card Guess
  const handleCardClick = (cardId: number) => {
    if (gameState.winner) return;

    sounds.playCardFlip();

    const { state: newState, card } = makeGuess(gameState, cardId);

    // Audio feedback depending on revealed card
    setTimeout(() => {
      if (card.type === 'assassin') {
        sounds.playAssassin();
      } else if (card.type === gameState.currentTeam) {
        sounds.playSuccess();
      } else if (card.type === 'neutral') {
        sounds.playNeutral();
      } else {
        sounds.playOpponentReveal();
      }
    }, 120);

    setGameState(newState);
  };

  // Handle Clue Submission
  const handleGiveClue = (word: string, count: number): { error?: string } => {
    const result = giveClue(gameState, word, count);
    if (!result.error) {
      sounds.playSuccess();
      setGameState(result.state);
    }
    return result;
  };

  // Handle Manual End Turn
  const handleEndTurn = () => {
    if (gameState.winner) return;
    sounds.playNeutral();
    setGameState((prev) => endTurn(prev));
  };

  // Handle Start New Game / Rematch
  const handleNewGame = () => {
    const nextSeed = generateSeed();
    const newGame = createGame({
      roomId: gameState.roomId,
      seed: nextSeed,
      language: gameState.language,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    setRole('operative');
    updateUrlHash(newGame.roomId, nextSeed, newGame.language);
  };

  // Handle Language Change
  const handleLanguageChange = (lang: Language) => {
    const newGame = createGame({
      roomId: gameState.roomId,
      seed: gameState.seed,
      language: lang,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    updateUrlHash(newGame.roomId, newGame.seed, lang);
  };

  // Timer Toggles
  const handleTimerToggle = () => {
    setGameState((prev) => ({ ...prev, isTimerRunning: !prev.isTimerRunning }));
  };

  const handleTimerReset = () => {
    setGameState((prev) => ({
      ...prev,
      timerSecondsLeft: prev.timerDuration,
      isTimerRunning: prev.timerDuration > 0,
    }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Spy grid background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header */}
      <Header
        roomId={gameState.roomId}
        language={gameState.language}
        onLanguageChange={handleLanguageChange}
        onNewGame={handleNewGame}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto py-2 flex flex-col relative z-10">
        {/* Score & Turn Banner */}
        <ScoreBoard
          gameState={gameState}
          onTimerToggle={handleTimerToggle}
          onTimerReset={handleTimerReset}
        />

        {/* Role Switcher */}
        <RoleToggle
          role={role}
          language={gameState.language}
          onRoleChange={(newRole) => setRole(newRole)}
        />

        {/* Active Clue & Guessing Controls */}
        <ClueBar
          gameState={gameState}
          role={role}
          onGiveClue={handleGiveClue}
          onEndTurn={handleEndTurn}
        />

        {/* 5x5 Card Grid */}
        <CardGrid
          gameState={gameState}
          role={role}
          onCardClick={handleCardClick}
        />

        {/* History Log Accordion */}
        <HistoryDrawer
          history={gameState.history}
          language={gameState.language}
        />
      </main>

      {/* Victory Celebration Modal */}
      <VictoryModal
        gameState={gameState}
        onNewGame={handleNewGame}
      />

      {/* Rules Explainer Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        language={gameState.language}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Footer */}
      <footer className="w-full py-4 text-center text-zinc-400 font-mono text-[11px] border-t border-zinc-900">
        <p>
          Codenames Web • {gameState.language === 'fr' ? 'Salle' : 'Room'}:{' '}
          <span className="text-zinc-300 font-bold">{gameState.roomId}</span> •{' '}
          Seed: <span className="text-zinc-300 font-bold">{gameState.seed}</span>
        </p>
      </footer>
    </div>
  );
}
