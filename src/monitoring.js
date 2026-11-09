import * as Sentry from '@sentry/react'

export const initMonitoring = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN

  if (!dsn) {
    return false
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION || undefined,
    tracesSampleRate: 0,
    sendDefaultPii: false,
  })

  return true
}
