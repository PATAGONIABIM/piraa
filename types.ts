// src/types.ts
export interface User {
  id: string;
  name: string;
  avatar: string;
  email?: string;
  phone?: string;
  dob?: string;
  // Campos adicionales para estadísticas que usaba el proyecto anterior
  matchesPlayed?: number;
  matchesWon?: number;
  matchesLost?: number;
  totalPoints?: number;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  court: string;
  address?: string; // Agregado del proyecto anterior
  matchTimestamp?: any; // Para manejar el objeto Date/Timestamp de Firebase
  players: User[];
  waitingList: User[];
  createdBy: User;
  teams?: {
    teamA: User[];
    teamB: User[];
  };
  score?: {
    team1: number[];
    team2: number[];
  };
  winner?: 'teamA' | 'teamB';
  playerStats?: { [userId: string]: { points: number } };