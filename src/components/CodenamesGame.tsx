'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameTheme, Language, LobbyPlayer, LobbyViewMode, PlayerRole, Team, UserTeamChoice } from '../lib/types';
import { createGame, giveClue, makeGuess, endTurn, generateSeed, generateRoomId } from '../lib/engine';
import { sounds } from '../lib/audio';
import { getLocalPlayerId, getLocalNickname, setLocalNickname, RoomSyncChannel } from '../lib/lobbySync';
import { Header } from './Header';
import { ScoreBoard } from './ScoreBoard';
import { RoleToggle } from './RoleToggle';
import { ClueBar } from './ClueBar';
import { CardGrid } from './CardGrid';
import { HistoryDrawer } from './HistoryDrawer';
import { VictoryModal } from './VictoryModal';
import { RulesModal } from './RulesModal';
import { LobbyView } from './LobbyView';

function getInitialGameState(): GameState {
  let initialRoom = generateRoomId();
  let initialSeed = generateSeed();
  let initialLang: Language = 'fr';
  let initialTheme: GameTheme = 'harrypotter';

  if (typeof window !== 'undefined') {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);

    const hashRoom = params.get('room');
    const hashSeed = params.get('seed');
    const hashLang = params.get('lang') as Language;
    const hashTheme = params.get('theme') as GameTheme;

    if (hashRoom) initialRoom = hashRoom;
    if (hashSeed) initialSeed = hashSeed;
    if (hashLang === 'en' || hashLang === 'fr') initialLang = hashLang;
    if (hashTheme === 'harrypotter' || hashTheme === 'classic') initialTheme = hashTheme;
  }

  return createGame({
    roomId: initialRoom,
    seed: initialSeed,
    language: initialLang,
    theme: initialTheme,
  });
}

export default function CodenamesGame() {
  const [gameState, setGameState] = useState<GameState>(getInitialGameState);
  const [viewMode, setViewMode] = useState<LobbyViewMode>('lobby'); // Pure Lobby by default!
  const [myTeam, setMyTeam] = useState<UserTeamChoice>('both');
  const [role, setRole] = useState<PlayerRole>('operative');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Player & Multi-tab Lobby synchronization
  const [playerId] = useState<string>(getLocalPlayerId);
  const [playerName, setPlayerName] = useState<string>(() => getLocalNickname('harrypotter'));
  const [players, setPlayers] = useState<LobbyPlayer[]>(() => [
    {
      id: getLocalPlayerId(),
      name: getLocalNickname('harrypotter'),
      team: 'spectator',
      role: 'operative',
    },
  ]);

  const channelRef = useRef<RoomSyncChannel | null>(null);

  // Sync state to URL hash
  const updateUrlHash = (room: string, seed: string, lang: Language, theme: GameTheme) => {
    if (typeof window !== 'undefined') {
      const newHash = `room=${room}&seed=${seed}&lang=${lang}&theme=${theme}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState(null, '', `#${newHash}`);
      }
    }
  };

  // Sync hash whenever room, seed, language, or theme changes
  useEffect(() => {
    updateUrlHash(gameState.roomId, gameState.seed, gameState.language, gameState.theme);
  }, [gameState.roomId, gameState.seed, gameState.language, gameState.theme]);

  // Set up BroadcastChannel for real-time room communication
  useEffect(() => {
    const channel = new RoomSyncChannel(gameState.roomId);
    channelRef.current = channel;

    // Broadcast current presence
    const currentMe: LobbyPlayer = {
      id: playerId,
      name: playerName,
      team: myTeam === 'both' ? 'spectator' : myTeam,
      role,
    };
    channel.broadcast('PRESENCE', currentMe);

    channel.onMessage((msg) => {
      if (!msg || !msg.type) return;

      if (msg.type === 'PRESENCE') {
        const incoming = msg.payload as LobbyPlayer;
        if (!incoming || incoming.id === playerId) return;

        setPlayers((prev) => {
          const filtered = prev.filter((p) => p.id !== incoming.id);
          return [...filtered, incoming];
        });

        // Reply with our presence so the newcomer knows about us
        channel.broadcast('REPLY_PRESENCE', currentMe);
      }

      if (msg.type === 'REPLY_PRESENCE') {
        const incoming = msg.payload as LobbyPlayer;
        if (!incoming || incoming.id === playerId) return;

        setPlayers((prev) => {
          const filtered = prev.filter((p) => p.id !== incoming.id);
          return [...filtered, incoming];
        });
      }

      if (msg.type === 'START_GAME') {
        setViewMode('game');
      }

      if (msg.type === 'CONFIG_UPDATE') {
        const { theme, language, timerDuration, seed } = msg.payload as {
          theme: GameTheme;
          language: Language;
          timerDuration: number;
          seed: string;
        };
        setGameState((prev) =>
          createGame({
            roomId: prev.roomId,
            seed,
            language,
            theme,
            timerDuration,
          })
        );
      }
    });

    return () => {
      channel.close();
    };
  }, [gameState.roomId, playerId, playerName, myTeam, role]);

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
      theme: gameState.theme,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    updateUrlHash(newGame.roomId, nextSeed, newGame.language, newGame.theme);
  };

  // Handle Language Change
  const handleLanguageChange = (lang: Language) => {
    const newGame = createGame({
      roomId: gameState.roomId,
      seed: gameState.seed,
      language: lang,
      theme: gameState.theme,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    updateUrlHash(newGame.roomId, newGame.seed, lang, newGame.theme);
    channelRef.current?.broadcast('CONFIG_UPDATE', {
      theme: gameState.theme,
      language: lang,
      timerDuration: gameState.timerDuration,
      seed: gameState.seed,
    });
  };

  // Handle Theme Change
  const handleThemeChange = (newTheme: GameTheme) => {
    const newGame = createGame({
      roomId: gameState.roomId,
      seed: gameState.seed,
      language: gameState.language,
      theme: newTheme,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    updateUrlHash(newGame.roomId, newGame.seed, newGame.language, newTheme);
    channelRef.current?.broadcast('CONFIG_UPDATE', {
      theme: newTheme,
      language: gameState.language,
      timerDuration: gameState.timerDuration,
      seed: gameState.seed,
    });
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

  const handleUpdateTimerDuration = (duration: number) => {
    setGameState((prev) => ({
      ...prev,
      timerDuration: duration,
      timerSecondsLeft: duration,
      isTimerRunning: duration > 0,
    }));
  };

  // LOBBY HANDLERS
  const handleUpdateNickname = (name: string) => {
    setPlayerName(name);
    setLocalNickname(name);
    const updated: LobbyPlayer = {
      id: playerId,
      name,
      team: myTeam === 'both' ? 'spectator' : myTeam,
      role,
    };
    setPlayers((prev) => prev.map((p) => (p.id === playerId ? updated : p)));
    channelRef.current?.broadcast('PRESENCE', updated);
  };

  const handleClaimSeat = (targetTeam: Team | 'spectator', targetRole: PlayerRole) => {
    const updatedTeamChoice: UserTeamChoice = targetTeam === 'spectator' ? 'both' : targetTeam;
    setMyTeam(updatedTeamChoice);
    setRole(targetRole);

    const updated: LobbyPlayer = {
      id: playerId,
      name: playerName,
      team: targetTeam,
      role: targetRole,
    };

    setPlayers((prev) => {
      const filtered = prev.filter((p) => p.id !== playerId);
      return [...filtered, updated];
    });

    channelRef.current?.broadcast('PRESENCE', updated);
  };

  const handleCreateRoom = (customRoomId: string) => {
    const nextSeed = generateSeed();
    const newGame = createGame({
      roomId: customRoomId,
      seed: nextSeed,
      language: gameState.language,
      theme: gameState.theme,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    setViewMode('lobby');
    updateUrlHash(customRoomId, nextSeed, newGame.language, newGame.theme);
  };

  const handleJoinRoom = (targetRoomId: string) => {
    const nextSeed = generateSeed();
    const newGame = createGame({
      roomId: targetRoomId,
      seed: nextSeed,
      language: gameState.language,
      theme: gameState.theme,
      timerDuration: gameState.timerDuration,
    });
    setGameState(newGame);
    setViewMode('lobby');
    updateUrlHash(targetRoomId, nextSeed, newGame.language, newGame.theme);
  };

  const handleStartGame = () => {
    setViewMode('game');
    channelRef.current?.broadcast('START_GAME', {});
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Spy grid background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Header */}
      <Header
        roomId={gameState.roomId}
        language={gameState.language}
        theme={gameState.theme}
        viewMode={viewMode}
        playerName={playerName}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        onToggleViewMode={() => setViewMode(viewMode === 'lobby' ? 'game' : 'lobby')}
        onNewGame={handleNewGame}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* VIEW CONDITIONAL: LOBBY VS 5x5 GAME BOARD */}
      {viewMode === 'lobby' ? (
        <main className="flex-1 w-full max-w-6xl mx-auto py-2 flex flex-col relative z-10">
          <LobbyView
            roomId={gameState.roomId}
            seed={gameState.seed}
            theme={gameState.theme}
            language={gameState.language}
            timerDuration={gameState.timerDuration}
            players={players}
            currentPlayerId={playerId}
            onUpdateNickname={handleUpdateNickname}
            onClaimSeat={handleClaimSeat}
            onUpdateTheme={handleThemeChange}
            onUpdateLanguage={handleLanguageChange}
            onUpdateTimer={handleUpdateTimerDuration}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartGame={handleStartGame}
          />
        </main>
      ) : (
        <main className="flex-1 w-full max-w-6xl mx-auto py-2 flex flex-col relative z-10">
          {/* Score & Turn Banner */}
          <ScoreBoard
            gameState={gameState}
            myTeam={myTeam}
            onTimerToggle={handleTimerToggle}
            onTimerReset={handleTimerReset}
            onJoinTeam={(team) => {
              setMyTeam(team);
              handleClaimSeat(team === 'both' ? 'spectator' : team, role);
            }}
          />

          {/* Role & Team Switcher */}
          <RoleToggle
            role={role}
            myTeam={myTeam}
            language={gameState.language}
            onRoleChange={(newRole) => {
              setRole(newRole);
              handleClaimSeat(myTeam === 'both' ? 'spectator' : myTeam, newRole);
            }}
            onTeamChange={(team) => {
              setMyTeam(team);
              handleClaimSeat(team === 'both' ? 'spectator' : team, role);
            }}
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
      )}

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
          Seed: <span className="text-zinc-300 font-bold">{gameState.seed}</span> •{' '}
          {gameState.theme === 'harrypotter' ? '⚡ Harry Potter' : 'Classique'}
        </p>
      </footer>
    </div>
  );
}
