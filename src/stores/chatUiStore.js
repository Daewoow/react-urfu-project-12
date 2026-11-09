import { createStore } from 'zustand/vanilla'

export const createChatUiStore = () =>
  createStore((set) => ({
    currentChannelId: null,
    activeModal: null,
    modalChannelId: null,
    setCurrentChannelId: (currentChannelId) => set({ currentChannelId }),
    openModal: (activeModal, modalChannelId = null) =>
      set({ activeModal, modalChannelId }),
    closeModal: () => set({ activeModal: null, modalChannelId: null }),
  }))
