import { AppShell, Button, Group, Paper, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import useAuthStore from '../stores/authStore.js'

const HeaderContent = () => {
  const { t } = useTranslation()
  const token = useAuthStore((state) => state.token)
  const username = useAuthStore((state) => state.username)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)

  return (
    <Group h="100%" justify="space-between" wrap="nowrap">
      <Text
        component={Link}
        to="/"
        fw={700}
        size="xl"
        c="inherit"
        style={{ textDecoration: 'none' }}
      >
        {t('app.title')}
      </Text>
      {token && (
        <Group gap="sm" wrap="nowrap">
          <Text size="sm" fw={500} truncate>
            {username}
          </Text>
          <Button variant="subtle" onClick={clearCredentials}>
            {t('auth.logout')}
          </Button>
        </Group>
      )}
    </Group>
  )
}

const AppHeader = ({ withinAppShell = false }) => {
  if (withinAppShell) {
    return (
      <AppShell.Header px="md">
        <HeaderContent />
      </AppShell.Header>
    )
  }

  return (
    <Paper component="header" h={60} px="md" radius={0} withBorder>
      <HeaderContent />
    </Paper>
  )
}

export default AppHeader
