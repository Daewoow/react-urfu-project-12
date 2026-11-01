import { Button, Center, Stack, Text, Title } from '@mantine/core'
import { Link } from 'react-router-dom'

const NotFoundPage = () => (
  <Center mih="100vh" px="md">
    <Stack align="center" gap="sm">
      <Title order={1}>404</Title>
      <Text c="dimmed" ta="center">
        Страница не найдена
      </Text>
      <Button component={Link} to="/">
        Вернуться на главную
      </Button>
    </Stack>
  </Center>
)

export default NotFoundPage
