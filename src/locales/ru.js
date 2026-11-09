const ru = {
  translation: {
    app: {
      title: 'Hexlet Chat',
    },
    common: {
      cancel: 'Отмена',
      retry: 'Повторить',
      requestError: 'Не удалось выполнить запрос. Попробуйте ещё раз.',
    },
    notifications: {
      successTitle: 'Готово',
      errorTitle: 'Ошибка',
      networkTitle: 'Ошибка соединения',
      networkError: 'Проверьте подключение к интернету.',
      loadError: 'Не удалось загрузить данные чата.',
      channelCreated: 'Канал создан',
      channelRenamed: 'Канал переименован',
      channelDeleted: 'Канал удалён',
    },
    auth: {
      username: {
        label: 'Имя пользователя',
        placeholder: 'Введите имя пользователя',
      },
      password: {
        label: 'Пароль',
        placeholder: 'Введите пароль',
      },
      logout: 'Выйти',
      login: {
        title: 'Войти',
        submit: 'Войти',
        usernameLabel: 'Ваш ник',
        errorTitle: 'Ошибка авторизации',
        invalidCredentials: 'Неверные имя пользователя или пароль',
        requestError:
          'Не удалось войти. Проверьте подключение и попробуйте ещё раз',
        noAccount: 'Нет аккаунта?',
      },
      signup: {
        title: 'Регистрация',
        link: 'Регистрация',
        submit: 'Зарегистрироваться',
        errorTitle: 'Ошибка регистрации',
        requestError:
          'Не удалось зарегистрироваться. Проверьте подключение и попробуйте ещё раз',
        usernamePlaceholder: 'От 3 до 20 символов',
        passwordPlaceholder: 'Не менее 6 символов',
        passwordConfirmationLabel: 'Подтвердите пароль',
        passwordConfirmationPlaceholder: 'Повторите пароль',
        usernameConflict: 'Пользователь с таким именем уже существует',
        hasAccount: 'Уже есть аккаунт?',
        loginLink: 'Войти',
      },
    },
    validation: {
      required: 'Обязательное поле',
      usernameLength: 'От 3 до 20 символов',
      passwordLength: 'Не менее 6 символов',
      passwordsMatch: 'Пароли должны совпадать',
      messageRequired: 'Введите сообщение',
    },
    chat: {
      loading: 'Загрузка чата',
      loadErrorTitle: 'Не удалось загрузить чат',
      loadErrorText: 'Проверьте подключение и попробуйте ещё раз.',
      connectionLostTitle: 'Ошибка соединения',
      connectionLostText:
        'Новые сообщения появятся после восстановления связи.',
      channelFallback: 'Канал',
      messageCount_one: '{{count}} сообщение',
      messageCount_few: '{{count}} сообщения',
      messageCount_many: '{{count}} сообщений',
      messageCount_other: '{{count}} сообщения',
      emptyChannel: 'В этом канале пока нет сообщений',
      sendError:
        'Не удалось отправить сообщение. Текст сохранён — попробуйте ещё раз.',
      newMessageLabel: 'Новое сообщение',
      newMessagePlaceholder: 'Введите сообщение',
      send: 'Отправить',
    },
    channels: {
      title: 'Каналы',
      label: '# {{name}}',
      addAction: '+',
      manageAction: 'Управление каналом',
      renameAction: 'Переименовать',
      deleteAction: 'Удалить',
      nameLabel: 'Имя канала',
      namePlaceholder: 'Новый канал',
      validation: {
        length: 'От 3 до 20 символов',
        maxLength: 'Не более 20 символов',
        unique: 'Канал с таким именем уже существует',
      },
      create: {
        title: 'Добавить канал',
        submit: 'Добавить',
      },
      rename: {
        title: 'Переименовать канал',
        submit: 'Переименовать',
      },
      delete: {
        title: 'Удалить канал',
        confirmation:
          'Удалить канал # {{name}}? Все его сообщения также будут удалены.',
        submit: 'Удалить',
      },
    },
    notFound: {
      message: 'Страница не найдена',
      back: 'Вернуться на главную',
    },
    errorBoundary: {
      title: 'Что-то пошло не так',
      message: 'Ошибка уже отправлена разработчикам. Попробуйте перезагрузить страницу.',
      reload: 'Перезагрузить страницу',
    },
  },
}

export default ru
