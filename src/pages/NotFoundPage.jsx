import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'

const NotFoundPage = () => {
  const { t } = useTranslation()

  return (
    <>
      <AppHeader />
      <Center mih="calc(100vh - 60px)" px="md">
        <Stack align="center" gap="sm">
          <Title order={1}>404</Title>
          <Text c="dimmed" ta="center">
            {t('notFound.message')}
          </Text>
          <Button component={Link} to="/">
            {t('notFound.back')}
          </Button>
        </Stack>
      </Center>
    </>
  )
}

export default NotFoundPage
