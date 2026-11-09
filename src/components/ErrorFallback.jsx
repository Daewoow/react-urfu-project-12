import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

const ErrorFallback = () => {
  const { t } = useTranslation()

  return (
    <Center mih="100vh" px="md">
      <Stack align="center" gap="sm">
        <Title order={1} ta="center">
          {t('errorBoundary.title')}
        </Title>
        <Text c="dimmed" ta="center">
          {t('errorBoundary.message')}
        </Text>
        <Button onClick={() => window.location.reload()}>
          {t('errorBoundary.reload')}
        </Button>
      </Stack>
    </Center>
  )
}

export default ErrorFallback
