import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNotificationStore } from '../stores/storeContext.js'

const NETWORK_NOTIFICATION_ID = 'network-unavailable'

const NetworkNotifications = () => {
  const { t } = useTranslation()
  const notificationStore = useNotificationStore()

  useEffect(() => {
    const handleOffline = () => {
      notifications.show(
        {
          id: NETWORK_NOTIFICATION_ID,
          color: 'red',
          title: t('notifications.networkTitle'),
          message: t('notifications.networkError'),
          autoClose: false,
        },
        notificationStore,
      )
    }
    const handleOnline = () =>
      notifications.hide(NETWORK_NOTIFICATION_ID, notificationStore)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (!window.navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      notifications.hide(NETWORK_NOTIFICATION_ID, notificationStore)
    }
  }, [notificationStore, t])

  return null
}

export default NetworkNotifications
