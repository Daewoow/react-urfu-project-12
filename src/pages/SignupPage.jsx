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
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/chatApi.js'
import AppHeader from '../components/AppHeader.jsx'
import useAuthStore from '../stores/authStore.js'

const combineValidators = (...validators) => (value, values, path) => {
  for (const validator of validators) {
    const error = validator(value, values, path)

    if (error) return error
  }

  return null
}

const SignupPage = () => {
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
        isNotEmpty('Обязательное поле'),
        hasLength({ min: 3, max: 20 }, 'От 3 до 20 символов'),
      ),
      password: combineValidators(
        isNotEmpty('Обязательное поле'),
        hasLength({ min: 6 }, 'Не менее 6 символов'),
      ),
      passwordConfirmation: combineValidators(
        isNotEmpty('Обязательное поле'),
        matchesField('password', 'Пароли должны совпадать'),
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
          'Пользователь с таким именем уже существует',
        )
      } else {
        setRequestError(
          'Не удалось зарегистрироваться. Проверьте подключение и попробуйте ещё раз',
        )
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
            Регистрация
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {requestError && (
                <Alert color="red" title="Ошибка регистрации">
                  {requestError}
                </Alert>
              )}
              <TextInput
                label="Имя пользователя"
                placeholder="От 3 до 20 символов"
                autoComplete="username"
                maxLength={20}
                required
                autoFocus
                disabled={isSubmitting}
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label="Пароль"
                placeholder="Не менее 6 символов"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                {...form.getInputProps('password')}
              />
              <PasswordInput
                label="Подтверждение пароля"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                required
                disabled={isSubmitting}
                {...form.getInputProps('passwordConfirmation')}
              />
              <Button type="submit" loading={isSubmitting} fullWidth>
                Зарегистрироваться
              </Button>
              <Text ta="center" size="sm">
                Уже есть аккаунт?{' '}
                <Anchor component={Link} to="/login">
                  Войти
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
