import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types/game';
import { userService } from '../services/userService';

interface Telemetry {
  speed: number;
  health: number;
  boost: number;
  wantedLevel: number;
  inCombatZone: boolean;
  playerHealth?: number;
  playerOxygen?: number;
  isSwimming?: boolean;
  hunger?: number;
  thirst?: number;
  money?: number;
  position?: [number, number];
}

interface GameContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  gameState: 'idle' | 'playing' | 'garage' | 'loading';
  gameMode: 'city' | 'parkour1' | 'parkour2' | 'story';
  isPlayerInCar: boolean;
  telemetry: Telemetry;
  setGameState: (state: 'idle' | 'playing' | 'garage' | 'loading') => void;
  setGameMode: (mode: 'city' | 'parkour1' | 'parkour2' | 'story') => void;
  setIsPlayerInCar: (inCar: boolean) => void;
  setTelemetry: (data: Partial<Telemetry>) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_TELEMETRY: Telemetry = {
  speed: 0,
  health: 100,
  boost: 100,
  wantedLevel: 0,
  inCombatZone: false,
  playerHealth: 100,
  playerOxygen: 100,
  isSwimming: false,
  hunger: 100,
  thirst: 100,
  money: 50, // Starting money for testing
};

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'garage' | 'loading'>('idle');
  const [gameMode, setGameMode] = useState<'city' | 'parkour1' | 'parkour2' | 'story'>('city');
  const [isPlayerInCar, setIsPlayerInCar] = useState(true);
  const [telemetry, setTelemetryState] = useState<Telemetry>(DEFAULT_TELEMETRY);

  const setTelemetry = (data: Partial<Telemetry>) => {
    setTelemetryState(prev => ({ ...prev, ...data }));
  };

  useEffect(() => {
    if (gameState === 'idle') {
      setTelemetryState(DEFAULT_TELEMETRY);
    }
  }, [gameState]);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await userService.initializeProfile(u);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    setLoading(true);
    try {
      const p = await userService.signIn();
      setProfile(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setProfile(null);
    setGameState('idle');
  };

  return (
    <GameContext.Provider value={{
      user,
      profile,
      loading,
      gameState,
      setGameState,
      gameMode,
      setGameMode,
      isPlayerInCar,
      setIsPlayerInCar,
      telemetry,
      setTelemetry,
      signIn,
      signOut: logout
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
