import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      username: null,
      setCredentials: ({ token, username }) => set({ token, username }),
      clearCredentials: () => set({ token: null, username: null }),
    }),
    {
      name: 'hexlet-chat-auth',
    },
  ),
)

export default useAuthStore
