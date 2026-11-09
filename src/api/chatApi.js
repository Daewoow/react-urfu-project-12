import { cleanProfanity } from '../utils/profanity.js'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const authorizedRequest = async (path, token, options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}`, response.status)
  }

  return response.json()
}

export const registerUser = async (credentials) => {
  const response = await fetch('/api/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new ApiError(`Registration failed with status ${response.status}`, response.status)
  }

  return response.json()
}

export const getChannels = (token) =>
  authorizedRequest('/api/v1/channels', token)

export const createChannel = (token, channel) =>
  authorizedRequest('/api/v1/channels', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...channel,
      name: cleanProfanity(channel.name),
    }),
  })

export const renameChannel = (token, channelId, channel) =>
  authorizedRequest(`/api/v1/channels/${channelId}`, token, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...channel,
      name: cleanProfanity(channel.name),
    }),
  })

export const removeChannel = (token, channelId) =>
  authorizedRequest(`/api/v1/channels/${channelId}`, token, {
    method: 'DELETE',
  })

export const getMessages = (token) =>
  authorizedRequest('/api/v1/messages', token)

export const createMessage = (token, message) =>
  authorizedRequest('/api/v1/messages', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...message,
      body: cleanProfanity(message.body),
    }),
  })
