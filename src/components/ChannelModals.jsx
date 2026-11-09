import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createChannel,
  removeChannel,
  renameChannel,
} from '../api/chatApi.js'
import useAuthStore from '../stores/authStore.js'
import useChatUiStore from '../stores/chatUiStore.js'
import {
  removeChannelFromCache,
  upsertChannelInCache,
} from '../utils/chatCache.js'

const validateChannelName = (value, channels, excludedChannelId = null) => {
  const name = value.trim()

  if (name.length < 3) {
    return 'От 3 до 20 символов'
  }

  if (name.length > 20) {
    return 'Не более 20 символов'
  }

  const nameExists = channels.some(
    (channel) =>
      channel.id !== excludedChannelId &&
      channel.name.trim().toLowerCase() === name.toLowerCase(),
  )

  return nameExists ? 'Канал с таким именем уже существует' : null
}

const MutationError = () => (
  <Alert color="red">Не удалось выполнить запрос. Попробуйте ещё раз.</Alert>
)

const CreateChannelModal = ({ channels }) => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const closeModal = useChatUiStore((state) => state.closeModal)
  const setCurrentChannelId = useChatUiStore(
    (state) => state.setCurrentChannelId,
  )
  const form = useForm({
    initialValues: { name: '' },
    validate: {
      name: (value) => validateChannelName(value, channels),
    },
  })
  const mutation = useMutation({
    mutationFn: ({ name }) => createChannel(token, { name }),
    onSuccess: (channel) => {
      upsertChannelInCache(queryClient, token, channel)
      setCurrentChannelId(channel.id)
      closeModal()
    },
    onError: (error) => {
      if (error.status === 401) {
        clearCredentials()
      }
    },
  })
  const handleClose = () => {
    if (!mutation.isPending) {
      closeModal()
    }
  }

  return (
    <Modal
      opened
      onClose={handleClose}
      title="Добавить канал"
      centered
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
    >
      <form
        onSubmit={form.onSubmit(({ name }) =>
          mutation.mutate({ name: name.trim() }),
        )}
      >
        <Stack>
          {mutation.isError && mutation.error?.status !== 401 && (
            <MutationError />
          )}
          <TextInput
            label="Имя канала"
            placeholder="Новый канал"
            maxLength={20}
            autoFocus
            disabled={mutation.isPending}
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end">
            <Button
              type="button"
              variant="default"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Добавить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

const RenameChannelModal = ({ channel, channels }) => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const closeModal = useChatUiStore((state) => state.closeModal)
  const form = useForm({
    initialValues: { name: channel.name },
    validate: {
      name: (value) => validateChannelName(value, channels, channel.id),
    },
  })
  const mutation = useMutation({
    mutationFn: ({ name }) => renameChannel(token, channel.id, { name }),
    onSuccess: (renamedChannel) => {
      upsertChannelInCache(queryClient, token, renamedChannel)
      closeModal()
    },
    onError: (error) => {
      if (error.status === 401) {
        clearCredentials()
      }
    },
  })
  const handleClose = () => {
    if (!mutation.isPending) {
      closeModal()
    }
  }

  return (
    <Modal
      opened
      onClose={handleClose}
      title="Переименовать канал"
      centered
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
    >
      <form
        onSubmit={form.onSubmit(({ name }) =>
          mutation.mutate({ name: name.trim() }),
        )}
      >
        <Stack>
          {mutation.isError && mutation.error?.status !== 401 && (
            <MutationError />
          )}
          <TextInput
            label="Имя канала"
            maxLength={20}
            autoFocus
            disabled={mutation.isPending}
            {...form.getInputProps('name')}
          />
          <Group justify="flex-end">
            <Button
              type="button"
              variant="default"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Переименовать
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

const DeleteChannelModal = ({ channel }) => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const closeModal = useChatUiStore((state) => state.closeModal)
  const mutation = useMutation({
    mutationFn: () => removeChannel(token, channel.id),
    onSuccess: ({ id }) => {
      removeChannelFromCache(queryClient, token, id)
      closeModal()
    },
    onError: (error) => {
      if (error.status === 401) {
        clearCredentials()
      }
    },
  })
  const handleClose = () => {
    if (!mutation.isPending) {
      closeModal()
    }
  }

  return (
    <Modal
      opened
      onClose={handleClose}
      title="Удалить канал"
      centered
      closeOnClickOutside={!mutation.isPending}
      closeOnEscape={!mutation.isPending}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutate()
        }}
      >
        <Stack>
          {mutation.isError && mutation.error?.status !== 401 && (
            <MutationError />
          )}
          <Text>
            Удалить канал <strong># {channel.name}</strong>? Все его сообщения
            также будут удалены.
          </Text>
          <Group justify="flex-end">
            <Button
              type="button"
              variant="default"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              color="red"
              loading={mutation.isPending}
              autoFocus
            >
              Удалить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

const ChannelModals = ({ channels }) => {
  const activeModal = useChatUiStore((state) => state.activeModal)
  const modalChannelId = useChatUiStore((state) => state.modalChannelId)
  const channel = channels.find(({ id }) => id === modalChannelId)

  if (activeModal === 'createChannel') {
    return <CreateChannelModal channels={channels} />
  }

  if (activeModal === 'renameChannel' && channel?.removable) {
    return (
      <RenameChannelModal
        key={channel.id}
        channel={channel}
        channels={channels}
      />
    )
  }

  if (activeModal === 'deleteChannel' && channel?.removable) {
    return <DeleteChannelModal key={channel.id} channel={channel} />
  }

  return null
}

export default ChannelModals
