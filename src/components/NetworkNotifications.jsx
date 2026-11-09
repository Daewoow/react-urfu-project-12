import { notifications } from '@mantine/notifications'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const NETWORK_NOTIFICATION_ID = 'network-unavailable'

const NetworkNotifications = () => {
  const { t } = useTranslation()

  useEffect(() => {
    const handleOffline = () => {
      notifications.show({
        id: NETWORK_NOTIFICATION_ID,
        color: 'red',
        title: t('notifications.networkTitle'),
        message: t('notifications.networkError'),
        autoClose: false,
      })
    }
    const handleOnline = () => notifications.hide(NETWORK_NOTIFICATION_ID)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    if (!window.navigator.onLine) {
      handleOffline()
    }

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
      notifications.hide(NETWORK_NOTIFICATION_ID)
    }
  }, [t])

  return null
}

export default NetworkNotifications
