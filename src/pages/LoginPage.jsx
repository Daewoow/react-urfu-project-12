import {
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'

const LoginPage = () => {
  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
  })

  return (
    <Center mih="100vh" px="md">
      <Paper w="100%" maw={420} p="xl" radius="md" shadow="md" withBorder>
        <Title order={1} ta="center" mb="lg">
          Войти
        </Title>

        <form onSubmit={form.onSubmit(() => {})}>
          <Stack>
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
            <Button type="submit" fullWidth>
              Войти
            </Button>
          </Stack>
        </form>
      </Paper>
    </Center>
  )
}

export default LoginPage
