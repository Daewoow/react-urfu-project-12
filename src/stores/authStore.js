import { createStore } from 'zustand/vanilla'
import { persist } from 'zustand/middleware'

const initialState = {
  token: null,
  username: null,
}

export const createAuthStore = () =>
  createStore(
    persist(
      (set) => ({
        ...initialState,
        setCredentials: ({ token, username }) => set({ token, username }),
        clearCredentials: () => set(initialState),
      }),
      {
        name: 'hexlet-chat-auth',
      },
    ),
  )
