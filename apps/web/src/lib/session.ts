import { create } from 'zustand';

export type Role = 'ADMIN' | 'DISPATCHER' | 'OPERATOR';
export type User = { id: string; email: string; role: Role };

type Session = {
  token: string | null;
  user: User | null;
  set: (token: string, user: User) => void;
  clear: () => void;
};

export const useSession = create<Session>((set) => ({
  token: localStorage.getItem('cwros_token'),
  user: JSON.parse(localStorage.getItem('cwros_user') || 'null'),
  set: (token, user) => {
    localStorage.setItem('cwros_token', token);
    localStorage.setItem('cwros_user', JSON.stringify(user));
    set({ token, user });
  },
  clear: () => {
    localStorage.removeItem('cwros_token');
    localStorage.removeItem('cwros_user');
    set({ token: null, user: null });
  }
}));
