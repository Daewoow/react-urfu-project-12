import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

export const AuthStoreContext = createContext(null)
export const ChatUiStoreContext = createContext(null)
export const NotificationStoreContext = createContext(null)

const useRequiredStore = (context, selector, storeName) => {
  const store = useContext(context)

  if (!store) {
    throw new Error(`${storeName} is not available`)
  }

  return useStore(store, selector)
}

export const useAuthStore = (selector) =>
  useRequiredStore(AuthStoreContext, selector, 'AuthStore')

export const useChatUiStore = (selector) =>
  useRequiredStore(ChatUiStoreContext, selector, 'ChatUiStore')

export const useChatUiStoreApi = () => {
  const store = useContext(ChatUiStoreContext)

  if (!store) {
    throw new Error('ChatUiStore is not available')
  }

  return store
}

export const useNotificationStore = () => {
  const store = useContext(NotificationStoreContext)

  if (!store) {
    throw new Error('NotificationStore is not available')
  }

  return store
}
