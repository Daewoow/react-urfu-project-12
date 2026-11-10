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
import { notifications } from '@mantine/notifications'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createMessage, getChannels, getMessages } from '../api/chatApi.js'
import AppHeader from '../components/AppHeader.jsx'
import ChannelModals from '../components/ChannelModals.jsx'
import {
  useAuthStore,
  useChatUiStore,
  useChatUiStoreApi,
  useNotificationStore,
} from '../stores/storeContext.js'
import {
  removeChannelFromCache,
  upsertChannelInCache,
  upsertMessageInCache,
} from '../utils/chatCache.js'
import { cleanProfanity } from '../utils/profanity.js'

const EMPTY_LIST = []

const HomePage = ({ socket }) => {
  const { t } = useTranslation()
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
  const chatUiStore = useChatUiStoreApi()
  const notificationStore = useNotificationStore()

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
        value.trim().length === 0 ? t('validation.messageRequired') : null,
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
  const hasLoadError = channelsQuery.isError || messagesQuery.isError

  useEffect(() => {
    if (isUnauthorized) {
      clearCredentials()
    }
  }, [clearCredentials, isUnauthorized])

  useEffect(() => {
    if (hasLoadError && !isUnauthorized) {
      notifications.show(
        {
          id: 'chat-load-error',
          color: 'red',
          title: t('notifications.errorTitle'),
          message: t('notifications.loadError'),
        },
        notificationStore,
      )
    } else {
      notifications.hide('chat-load-error', notificationStore)
    }
  }, [hasLoadError, isUnauthorized, notificationStore, t])

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
      removeChannelFromCache(queryClient, token, id, chatUiStore)
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
  }, [chatUiStore, queryClient, socket, token])

  const handleMessageSubmit = ({ body }) => {
    createMessageMutation.mutate({ body: body.trim() })
  }

  if (channelsQuery.isPending || messagesQuery.isPending) {
    return (
      <>
        <AppHeader />
        <Center mih="calc(100vh - 60px)">
          <Loader aria-label={t('chat.loading')} />
        </Center>
      </>
    )
  }

  if (channelsQuery.isError || messagesQuery.isError) {
    return (
      <>
        <AppHeader />
        <Center mih="calc(100vh - 60px)" px="md">
          <Alert color="red" title={t('chat.loadErrorTitle')} maw={520}>
            <Stack gap="sm">
              <Text>{t('chat.loadErrorText')}</Text>
              <Button
                variant="light"
                onClick={() => {
                  channelsQuery.refetch()
                  messagesQuery.refetch()
                }}
              >
                {t('common.retry')}
              </Button>
            </Stack>
          </Alert>
        </Center>
      </>
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
      <AppHeader withinAppShell />

      <AppShell.Navbar p="md">
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <Text fw={700}>{t('channels.title')}</Text>
            <Badge variant="light">{channels.length}</Badge>
          </Group>
          <ActionIcon
            variant="light"
            aria-label={t('channels.addAction')}
            title={t('channels.addAction')}
            onClick={() => openModal('createChannel')}
          >
            +
          </ActionIcon>
        </Group>
        <Divider mb="xs" />
        <ScrollArea flex={1}>
          <Stack gap={4}>
            {channels.map((channel) => {
              const channelName = cleanProfanity(channel.name)
              const channelLabel = t('channels.label', {
                name: channelName,
              })
              const channelLink = (
                <NavLink
                  component="button"
                  type="button"
                  aria-label={channelLabel}
                  leftSection="#"
                  label={channelName}
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
                        aria-label={t('channels.manageAction', {
                          name: cleanProfanity(channel.name),
                        })}
                        title={t('channels.manageAction', {
                          name: cleanProfanity(channel.name),
                        })}
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
                        {t('channels.renameAction')}
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        onClick={() =>
                          openModal('deleteChannel', channel.id)
                        }
                      >
                        {t('channels.deleteAction')}
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
            <Alert color="yellow" title={t('chat.connectionLostTitle')}>
              {t('chat.connectionLostText')}
            </Alert>
          )}
          <Box>
            <Title order={3}>
              {t('channels.label', {
                name: currentChannel
                  ? cleanProfanity(currentChannel.name)
                  : t('chat.channelFallback'),
              })}
            </Title>
            <Text size="sm" c="dimmed">
              {t('chat.messageCount', { count: currentMessages.length })}
            </Text>
          </Box>
          <Divider />

          <ScrollArea flex={1}>
            {currentMessages.length === 0 ? (
              <Center h="100%" mih={240}>
                <Text c="dimmed">{t('chat.emptyChannel')}</Text>
              </Center>
            ) : (
              <Stack gap="sm" pr="sm">
                {currentMessages.map((message) => (
                  <Paper key={message.id} p="sm" radius="md" withBorder>
                    <Text fw={700} size="sm">
                      {message.username}
                    </Text>
                    <Text style={{ overflowWrap: 'anywhere' }}>
                      {cleanProfanity(message.body)}
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
                    {t('chat.sendError')}
                  </Alert>
                )}
              <Group align="flex-end" wrap="nowrap">
                <TextInput
                  label={t('chat.newMessageLabel')}
                  placeholder={t('chat.newMessagePlaceholder')}
                  aria-label={t('chat.newMessageLabel')}
                  flex={1}
                  disabled={!currentChannel || createMessageMutation.isPending}
                  {...messageForm.getInputProps('body')}
                />
                <Button
                  type="submit"
                  loading={createMessageMutation.isPending}
                  disabled={!currentChannel}
                >
                  {t('chat.send')}
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
