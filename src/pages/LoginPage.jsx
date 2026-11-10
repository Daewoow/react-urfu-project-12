import {
  Alert,
  Anchor,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader.jsx'
import { useAuthStore } from '../stores/storeContext.js'

const LoginPage = () => {
  const { t } = useTranslation()
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
        setAuthError(t('auth.login.invalidCredentials'))
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
      setAuthError(t('auth.login.requestError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      <AppHeader />
      <Center mih="calc(100vh - 60px)" px="md" py="xl">
        <Paper w="100%" maw={420} p="xl" radius="md" shadow="md" withBorder>
          <Title order={1} ta="center" mb="lg">
            {t('auth.login.title')}
          </Title>

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {authError && (
                <Alert color="red" title={t('auth.login.errorTitle')}>
                  {authError}
                </Alert>
              )}
              <TextInput
                label={t('auth.login.usernameLabel')}
                placeholder={t('auth.username.placeholder')}
                autoComplete="username"
                required
                autoFocus
                disabled={isSubmitting}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label={t('auth.password.label')}
                aria-label={t('auth.password.label')}
                placeholder={t('auth.password.placeholder')}
                autoComplete="current-password"
                required
                disabled={isSubmitting}
                {...form.getInputProps('password')}
              />
              <Button type="submit" loading={isSubmitting} fullWidth>
                {t('auth.login.submit')}
              </Button>
              <Text ta="center" size="sm">
                {t('auth.login.noAccount')}{' '}
                <Anchor component={Link} to="/signup">
                  {t('auth.signup.link')}
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Center>
    </>
  )
}

export default LoginPage
