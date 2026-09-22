import { create } from 'zustand';

export type Role = 'ADMIN' | 'DISPATCHER' | 'OPERATOR';
export type User = { id: string; email: string; role: Role };

type Session = {
  token: string | null;
  user: User | null;
};

export const useSession = create<Session>(() => ({
  token: 'mock-token',
  user: { id: 'mock-id', email: 'admin@cwros.com', role: 'ADMIN' }
}));
