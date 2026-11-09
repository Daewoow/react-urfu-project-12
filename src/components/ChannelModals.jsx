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
import { useTranslation } from 'react-i18next'
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

const validateChannelName = (
  value,
  channels,
  t,
  excludedChannelId = null,
) => {
  const name = value.trim()

  if (name.length < 3) {
    return t('channels.validation.length')
  }

  if (name.length > 20) {
    return t('channels.validation.maxLength')
  }

  const nameExists = channels.some(
    (channel) =>
      channel.id !== excludedChannelId &&
      channel.name.trim().toLowerCase() === name.toLowerCase(),
  )

  return nameExists ? t('channels.validation.unique') : null
}

const MutationError = () => {
  const { t } = useTranslation()

  return <Alert color="red">{t('common.requestError')}</Alert>
}

const CreateChannelModal = ({ channels }) => {
  const { t } = useTranslation()
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
      name: (value) => validateChannelName(value, channels, t),
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
      title={t('channels.create.title')}
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
            label={t('channels.nameLabel')}
            placeholder={t('channels.namePlaceholder')}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {t('channels.create.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

const RenameChannelModal = ({ channel, channels }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)
  const clearCredentials = useAuthStore((state) => state.clearCredentials)
  const closeModal = useChatUiStore((state) => state.closeModal)
  const form = useForm({
    initialValues: { name: channel.name },
    validate: {
      name: (value) => validateChannelName(value, channels, t, channel.id),
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
      title={t('channels.rename.title')}
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
            label={t('channels.nameLabel')}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {t('channels.rename.submit')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}

const DeleteChannelModal = ({ channel }) => {
  const { t } = useTranslation()
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
      title={t('channels.delete.title')}
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
          <Text>{t('channels.delete.confirmation', { name: channel.name })}</Text>
          <Group justify="flex-end">
            <Button
              type="button"
              variant="default"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              color="red"
              loading={mutation.isPending}
              autoFocus
            >
              {t('channels.delete.submit')}
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
