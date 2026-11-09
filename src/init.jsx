import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { MantineProvider } from '@mantine/core'
import { createNotificationsStore, Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as Sentry from '@sentry/react'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorFallback from './components/ErrorFallback.jsx'
import NetworkNotifications from './components/NetworkNotifications.jsx'
import ru from './locales/ru.js'
import StoreProvider from './stores/StoreProvider.jsx'
import { createAuthStore } from './stores/authStore.js'
import { createChatUiStore } from './stores/chatUiStore.js'

const init = async (socket) => {
  const i18n = i18next.createInstance()
  await i18n.use(initReactI18next).init({
    resources: { ru },
    lng: 'ru',
    fallbackLng: 'ru',
    supportedLngs: ['ru'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  document.title = i18n.t('app.title')

  const authStore = createAuthStore()
  const chatUiStore = createChatUiStore()
  const notificationStore = createNotificationsStore()

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          error?.status !== 401 && failureCount < 2,
      },
    },
  })

  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <StoreProvider
            authStore={authStore}
            chatUiStore={chatUiStore}
            notificationStore={notificationStore}
          >
            <MantineProvider>
              <Notifications
                store={notificationStore}
                position="top-right"
                limit={4}
              />
              <NetworkNotifications />
              <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
                <App socket={socket} />
              </Sentry.ErrorBoundary>
            </MantineProvider>
          </StoreProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </I18nextProvider>
  )
}

export default init
