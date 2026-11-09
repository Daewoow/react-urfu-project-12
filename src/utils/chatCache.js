const upsertById = (items = [], nextItem) => {
  const itemExists = items.some(({ id }) => id === nextItem.id)

  if (!itemExists) {
    return [...items, nextItem]
  }

  return items.map((item) => (item.id === nextItem.id ? nextItem : item))
}

export const upsertMessageInCache = (queryClient, token, message) => {
  queryClient.setQueryData(['messages', token], (messages) =>
    upsertById(messages, message),
  )
}

export const upsertChannelInCache = (queryClient, token, channel) => {
  queryClient.setQueryData(['channels', token], (channels) =>
    upsertById(channels, channel),
  )
}

export const removeChannelFromCache = (
  queryClient,
  token,
  channelId,
  chatUiStore,
) => {
  let remainingChannels = []

  queryClient.setQueryData(['channels', token], (channels = []) => {
    remainingChannels = channels.filter(({ id }) => id !== channelId)
    return remainingChannels
  })
  queryClient.setQueryData(['messages', token], (messages = []) =>
    messages.filter((message) => message.channelId !== channelId),
  )

  const uiState = chatUiStore.getState()

  if (uiState.currentChannelId === channelId) {
    const generalChannel = remainingChannels.find(
      ({ name }) => name.toLowerCase() === 'general',
    )
    uiState.setCurrentChannelId(
      generalChannel?.id ?? remainingChannels[0]?.id ?? null,
    )
  }

  if (uiState.modalChannelId === channelId) {
    uiState.closeModal()
  }
}
