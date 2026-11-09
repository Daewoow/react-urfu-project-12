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

export const getChannels = (token) =>
  authorizedRequest('/api/v1/channels', token)

export const getMessages = (token) =>
  authorizedRequest('/api/v1/messages', token)

export const createMessage = (token, message) =>
  authorizedRequest('/api/v1/messages', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })
