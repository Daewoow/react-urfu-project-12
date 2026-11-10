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
import {
  hasLength,
  isNotEmpty,
  matchesField,
  useForm,
} from '@mantine/form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/chatApi.js'
import AppHeader from '../components/AppHeader.jsx'
import { useAuthStore } from '../stores/storeContext.js'

const combineValidators = (...validators) => (value, values, path) => {
  for (const validator of validators) {
    const error = validator(value, values, path)

    if (error) return error
  }

  return null
}

const SignupPage = () => {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestError, setRequestError] = useState(null)
  const token = useAuthStore((state) => state.token)
  const setCredentials = useAuthStore((state) => state.setCredentials)
  const navigate = useNavigate()
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      passwordConfirmation: '',
    },
    validate: {
      username: combineValidators(
        isNotEmpty(t('validation.required')),
        hasLength({ min: 3, max: 20 }, t('validation.usernameLength')),
      ),
      password: combineValidators(
        isNotEmpty(t('validation.required')),
        hasLength({ min: 6 }, t('validation.passwordLength')),
      ),
      passwordConfirmation: combineValidators(
        isNotEmpty(t('validation.required')),
        matchesField('password', t('validation.passwordsMatch')),
      ),
    },
  })

  const handleSubmit = async ({ username, password }) => {
    setRequestError(null)
    setIsSubmitting(true)

    try {
      const credentials = await registerUser({
        username: username.trim(),
        password,
      })

      if (!credentials.token) {
        throw new Error('Registration response does not contain a token')
      }

      setCredentials(credentials)
      navigate('/', { replace: true })
    } catch (error) {
      if (error.status === 409) {
        form.setFieldError(
          'username',
          t('auth.signup.usernameConflict'),
        )
      } else {
        setRequestError(t('auth.signup.requestError'))
      }
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
        <Paper w="100%" maw={440} p="xl" radius="md" shadow="md" withBorder>
          <Title order={1} ta="center" mb="lg">
            {t('auth.signup.title')}
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {requestError && (
                <Alert color="red" title={t('auth.signup.errorTitle')}>
                  {requestError}
                </Alert>
              )}
              <TextInput
                label={t('auth.username.label')}
                placeholder={t('auth.signup.usernamePlaceholder')}
                autoComplete="username"
                maxLength={20}
                required
                autoFocus
                disabled={isSubmitting}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label={t('auth.password.label')}
                aria-label={t('auth.password.label')}
                placeholder={t('auth.signup.passwordPlaceholder')}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label={t('auth.signup.passwordConfirmationLabel')}
                aria-label={t('auth.signup.passwordConfirmationLabel')}
                placeholder={t('auth.signup.passwordConfirmationPlaceholder')}
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                {...form.getInputProps('passwordConfirmation')}
              />
              <Button type="submit" loading={isSubmitting} fullWidth>
                {t('auth.signup.submit')}
              </Button>
              <Text ta="center" size="sm">
                {t('auth.signup.hasAccount')}{' '}
                <Anchor component={Link} to="/login">
                  {t('auth.signup.loginLink')}
                </Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Center>
    </>
  )
}

export default SignupPage
