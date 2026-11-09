import {
  ActionIcon,
  Alert,
  AppShell,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Menu,
  NavLink,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { createMessage, getChannels, getMessages } from '../api/chatApi.js'
import ChannelModals from '../components/ChannelModals.jsx'
import useAuthStore from '../stores/authStore.js'
import useChatUiStore from '../stores/chatUiStore.js'
import {
  removeChannelFromCache,
  upsertChannelInCache,
  upsertMessageInCache,
} from '../utils/chatCache.js'

const EMPTY_LIST = []

const HomePage = ({ socket }) => {
  const queryClient = useQueryClient()
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected)
  const token = useAuthStore((state) => state.token)
  const username = useAuthStore((state) => state.username)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const currentChannelId = useChatUiStore((state) => state.currentChannelId)
  const setCurrentChannelId = useChatUiStore(
    (state) => state.setCurrentChannelId,
  )
  const openModal = useChatUiStore((state) => state.openModal)

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
    validate: {
      body: (value) =>
        value.trim().length === 0 ? 'Введите сообщение' : null,
    },
  })
  const createMessageMutation = useMutation({
    mutationFn: ({ body }) =>
      createMessage(token, {
        body,
        channelId: currentChannelId,
        username,
      }),
    onSuccess: (newMessage) => {
      upsertMessageInCache(queryClient, token, newMessage)
      messageForm.reset()
    },
    onError: (error) => {
      if (error.status === 401) {
        clearCredentials()
      }
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
      const generalChannel = channels.find(
        ({ name }) => name.toLowerCase() === 'general',
      )
      setCurrentChannelId((generalChannel ?? channels[0]).id)
    }
  }, [channels, currentChannelId, setCurrentChannelId])

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      upsertMessageInCache(queryClient, token, newMessage)
    }
    const handleNewChannel = (channel) =>
      upsertChannelInCache(queryClient, token, channel)
    const handleRenameChannel = (channel) =>
      upsertChannelInCache(queryClient, token, channel)
    const handleRemoveChannel = ({ id }) =>
      removeChannelFromCache(queryClient, token, id)
    const handleConnect = () => {
      setIsSocketConnected(true)
      queryClient.invalidateQueries({ queryKey: ['channels', token] })
      queryClient.invalidateQueries({ queryKey: ['messages', token] })
    }
    const handleDisconnect = () => setIsSocketConnected(false)

    socket.on('newMessage', handleNewMessage)
    socket.on('newChannel', handleNewChannel)
    socket.on('renameChannel', handleRenameChannel)
    socket.on('removeChannel', handleRemoveChannel)
    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleDisconnect)

    return () => {
      socket.off('newMessage', handleNewMessage)
      socket.off('newChannel', handleNewChannel)
      socket.off('renameChannel', handleRenameChannel)
      socket.off('removeChannel', handleRemoveChannel)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleDisconnect)
    }
  }, [queryClient, socket, token])

  const handleMessageSubmit = ({ body }) => {
    createMessageMutation.mutate({ body: body.trim() })
  }

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
    <>
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
          <Group gap="xs">
            <Text fw={700}>Каналы</Text>
            <Badge variant="light">{channels.length}</Badge>
          </Group>
          <ActionIcon
            variant="light"
            aria-label="Добавить канал"
            title="Добавить канал"
            onClick={() => openModal('createChannel')}
          >
            +
          </ActionIcon>
        </Group>
        <Divider mb="xs" />
        <ScrollArea flex={1}>
          <Stack gap={4}>
            {channels.map((channel) => {
              const channelLink = (
                <NavLink
                  label={`# ${channel.name}`}
                  active={channel.id === currentChannelId}
                  onClick={() => setCurrentChannelId(channel.id)}
                  styles={{
                    label: {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              )

              if (!channel.removable) {
                return <Box key={channel.id}>{channelLink}</Box>
              }

              return (
                <Group key={channel.id} gap={4} wrap="nowrap">
                  <Box flex={1} miw={0}>
                    {channelLink}
                  </Box>
                  <Menu position="right-start" withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        aria-label={`Управление каналом ${channel.name}`}
                        title="Управление каналом"
                      >
                        ⋮
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        onClick={() =>
                          openModal('renameChannel', channel.id)
                        }
                      >
                        Переименовать
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        onClick={() =>
                          openModal('deleteChannel', channel.id)
                        }
                      >
                        Удалить
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              )
            })}
          </Stack>
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Stack h="calc(100vh - 92px)" gap="md">
          {!isSocketConnected && (
            <Alert color="yellow" title="Соединение потеряно">
              Новые сообщения появятся после восстановления связи.
            </Alert>
          )}
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
                    <Text style={{ overflowWrap: 'anywhere' }}>
                      {message.body}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            )}
          </ScrollArea>

          <form onSubmit={messageForm.onSubmit(handleMessageSubmit)}>
            <Stack gap="xs">
              {createMessageMutation.isError &&
                createMessageMutation.error?.status !== 401 && (
                  <Alert color="red">
                    Не удалось отправить сообщение. Текст сохранён — попробуйте
                    ещё раз.
                  </Alert>
                )}
              <Group align="flex-end" wrap="nowrap">
                <TextInput
                  label="Новое сообщение"
                  placeholder="Введите сообщение"
                  aria-label="Новое сообщение"
                  flex={1}
                  disabled={!currentChannel || createMessageMutation.isPending}
                  {...messageForm.getInputProps('body')}
                />
                <Button
                  type="submit"
                  loading={createMessageMutation.isPending}
                  disabled={!currentChannel}
                >
                  Отправить
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </AppShell.Main>
      </AppShell>
      <ChannelModals channels={channels} />
    </>
  )
}

export default HomePage
