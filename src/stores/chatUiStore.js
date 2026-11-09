import { create } from 'zustand'

const useChatUiStore = create((set) => ({
  currentChannelId: null,
  activeModal: null,
  setCurrentChannelId: (currentChannelId) => set({ currentChannelId }),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}))

export default useChatUiStore
