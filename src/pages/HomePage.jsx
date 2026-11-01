import { Container, Stack, Text, Title } from '@mantine/core'

const HomePage = () => (
  <Container size="md" py="xl">
    <Stack gap="xs">
      <Title order={1}>Hexlet Chat</Title>
      <Text c="dimmed">Здесь будет страница чата.</Text>
    </Stack>
  </Container>
)

export default HomePage
