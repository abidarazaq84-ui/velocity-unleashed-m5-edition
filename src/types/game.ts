export enum Rank {
  Bronze = 'Bronze',
  Silver = 'Silver',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond',
  Legendary = 'Legendary'
}

export interface UserStats {
  totalWins: number;
  totalKills: number;
  matchesPlayed: number;
  highestScore: number;
}

export const CAR_MODELS = {
  BMW_M5: {
    name: "BMW M5 Competition",
    color: "#ffffff",
    stats: { topSpeed: 95, accel: 85, handling: 75 },
    price: 0,
  },
  TESLA_S: {
    name: "Tesla Model S Plaid",
    color: "#ef4444",
    stats: { topSpeed: 90, accel: 100, handling: 80 },
    price: 50000,
  },
  AUDI_R8: {
    name: "Audi R8 Coupe",
    color: "#3b82f6",
    stats: { topSpeed: 98, accel: 80, handling: 90 },
    price: 120000,
  },
};

export interface Inventory {
  cars: (keyof typeof CAR_MODELS)[];
  currentCar: keyof typeof CAR_MODELS;
  guns: string[];
  paints: string[];
  decals: string[];
  upgrades: Record<string, number>;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  currency: number;
  xp: number;
  rank: Rank;
  rankPoints: number;
  inventory: Inventory;
  stats: UserStats;
  achievements: string[];
  dailyChallengeStatus: Record<string, boolean>;
  lastMatchId?: string;
}

export interface CarState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  health: number;
  currentGun?: string;
  isFiring?: boolean;
}

export interface RoomState {
  roomId: string;
  players: Record<string, CarState & { displayName: string }>;
  status: 'waiting' | 'starting' | 'playing' | 'finished';
}
