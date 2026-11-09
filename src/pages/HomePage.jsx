import {
  Alert,
  AppShell,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { getChannels, getMessages } from '../api/chatApi.js'
import useAuthStore from '../stores/authStore.js'
import useChatUiStore from '../stores/chatUiStore.js'

const EMPTY_LIST = []

const HomePage = () => {
  const token = useAuthStore((state) => state.token)
  const username = useAuthStore((state) => state.username)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const currentChannelId = useChatUiStore((state) => state.currentChannelId)
  const setCurrentChannelId = useChatUiStore(
    (state) => state.setCurrentChannelId,
  )

  const channelsQuery = useQuery({
    queryKey: ['channels', token],
    queryFn: () => getChannels(token),
    enabled: Boolean(token),
  })
  const messagesQuery = useQuery({
    queryKey: ['messages', token],
    queryFn: () => getMessages(token),
    enabled: Boolean(token),
  })
  const messageForm = useForm({
    initialValues: {
      body: '',
    },
  })

  const channels = channelsQuery.data ?? EMPTY_LIST
  const messages = messagesQuery.data ?? EMPTY_LIST
  const isUnauthorized =
    channelsQuery.error?.status === 401 || messagesQuery.error?.status === 401

  useEffect(() => {
    if (isUnauthorized) {
      clearCredentials()
    }
  }, [clearCredentials, isUnauthorized])

  useEffect(() => {
    if (channels.length === 0) {
      return
    }

    const currentChannelExists = channels.some(
      ({ id }) => id === currentChannelId,
    )

    if (!currentChannelExists) {
      setCurrentChannelId(channels[0].id)
    }
  }, [channels, currentChannelId, setCurrentChannelId])

  if (channelsQuery.isPending || messagesQuery.isPending) {
    return (
      <Center mih="100vh">
        <Loader aria-label="Загрузка чата" />
      </Center>
    )
  }

  if (channelsQuery.isError || messagesQuery.isError) {
    return (
      <Center mih="100vh" px="md">
        <Alert color="red" title="Не удалось загрузить чат" maw={520}>
          <Stack gap="sm">
            <Text>Проверьте подключение и попробуйте ещё раз.</Text>
            <Button
              variant="light"
              onClick={() => {
                channelsQuery.refetch()
                messagesQuery.refetch()
              }}
            >
              Повторить
            </Button>
          </Stack>
        </Alert>
      </Center>
    )
  }

  const currentChannel = channels.find(({ id }) => id === currentChannelId)
  const currentMessages = messages.filter(
    ({ channelId }) => channelId === currentChannelId,
  )

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Title order={2}>Hexlet Chat</Title>
          <Group gap="sm">
            <Text size="sm" fw={500}>
              {username}
            </Text>
            <Button variant="subtle" onClick={clearCredentials}>
              Выйти
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Group justify="space-between" mb="sm">
          <Text fw={700}>Каналы</Text>
          <Badge variant="light">{channels.length}</Badge>
        </Group>
        <Divider mb="xs" />
        <ScrollArea>
          <Stack gap={4}>
            {channels.map((channel) => (
              <NavLink
                key={channel.id}
                label={`# ${channel.name}`}
                active={channel.id === currentChannelId}
                onClick={() => setCurrentChannelId(channel.id)}
              />
            ))}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack h="calc(100vh - 92px)" gap="md">
          <Box>
            <Title order={3}># {currentChannel?.name ?? 'Канал'}</Title>
            <Text size="sm" c="dimmed">
              {currentMessages.length} сообщений
            </Text>
          </Box>
          <Divider />

          <ScrollArea flex={1}>
            {currentMessages.length === 0 ? (
              <Center h="100%" mih={240}>
                <Text c="dimmed">В этом канале пока нет сообщений</Text>
              </Center>
            ) : (
              <Stack gap="sm" pr="sm">
                {currentMessages.map((message) => (
                  <Paper key={message.id} p="sm" radius="md" withBorder>
                    <Text fw={700} size="sm">
                      {message.username}
                    </Text>
                    <Text>{message.body}</Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </ScrollArea>

          <form onSubmit={messageForm.onSubmit(() => {})}>
            <Group align="flex-end" wrap="nowrap">
              <TextInput
                label="Новое сообщение"
                placeholder="Введите сообщение"
                aria-label="Новое сообщение"
                flex={1}
                disabled={!currentChannel}
                {...messageForm.getInputProps('body')}
              />
              <Button type="submit" disabled={!currentChannel}>
                Отправить
              </Button>
            </Group>
          </form>
        </Stack>
      </AppShell.Main>
    </AppShell>
  )
}

export default HomePage
