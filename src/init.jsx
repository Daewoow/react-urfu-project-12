import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import i18next from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import NetworkNotifications from './components/NetworkNotifications.jsx'
import ru from './locales/ru.js'

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
          <MantineProvider>
            <Notifications position="top-right" limit={4} />
            <NetworkNotifications />
            <App socket={socket} />
          </MantineProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </I18nextProvider>
  )
}

export default init
