import { defineStore } from 'pinia';
import { login } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || ''
  }),
  actions: {
    async signIn(email: string, password: string) {
      try {
        const { data } = await login(email, password);
        this.user = data.user;
        this.token = data.token;
        localStorage.setItem('token', data.token);
      } catch (error) {
        //console.error('Login failed', error);
      }
    },
    signOut() {
      this.user = null;
      this.token = '';
      localStorage.removeItem('token');
    }
  }
});