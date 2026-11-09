import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore.js'

const LoginPage = () => {
  const [authError, setAuthError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = useAuthStore((state) => state.token)
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const location = useLocation()
  const navigate = useNavigate()
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  })

  const handleSubmit = async (values) => {
    setAuthError(null)
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.status === 401) {
        setAuthError('Неверные имя пользователя или пароль')
        return
      }

      if (!response.ok) {
        throw new Error(`Authorization failed with status ${response.status}`)
      }

      const credentials = await response.json()

      if (!credentials.token) {
        throw new Error('Authorization response does not contain a token')
      }

      setCredentials(credentials)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch {
      setAuthError('Не удалось войти. Проверьте подключение и попробуйте ещё раз')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <Center mih="100vh" px="md">
      <Paper w="100%" maw={420} p="xl" radius="md" shadow="md" withBorder>
        <Title order={1} ta="center" mb="lg">
          Войти
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            {authError && (
              <Alert color="red" title="Ошибка авторизации">
                {authError}
              </Alert>
            )}
            <TextInput
              label="Имя пользователя"
              placeholder="Введите имя пользователя"
              autoComplete="username"
              required
              {...form.getInputProps('username')}
            />
            <PasswordInput
              label="Пароль"
              placeholder="Введите пароль"
              autoComplete="current-password"
              required
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}

export default LoginPage
