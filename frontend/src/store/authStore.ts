import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

interface User {
  id: number;
  email: string;
  nome: string;
  isAdmin?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  senha: string;
  confirmarSenha: string;
  nome: string;
  cpf_cnpj?: string;
  telefone?: string;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, senha: string) => {
        try {
          const response = await api.post('/api/auth/login', { email, senha });
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Erro ao fazer login');
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await api.post('/api/auth/register', data);
          const { token, user } = response.data;

          localStorage.setItem('token', token);
          set({ user, token, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Erro ao registrar');
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/api/auth/me');
          set({ user: response.data.user });
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
