import type { GameAccess, GamePlatform, GameStatus } from './types';

export const strings = {
  app: {
    title: 'GameTracker',
  },
  // Short labels: three tabs share one row, so the full status names do not fit.
  tabs: {
    wishlist: 'Хочу',
    available: 'Есть',
    played: 'Играл',
  } satisfies Record<GameStatus, string>,
  search: {
    games: 'Поиск игры',
  },
  empty: {
    wishlist: {
      title: 'Список желаний пуст',
      message: 'Нажми «+», чтобы добавить игру, в которую хочешь поиграть.',
    },
    available: {
      title: 'Доступных игр пока нет',
      message: 'Нажми «+», чтобы добавить игру, к которой есть доступ, но руки не дошли.',
    },
    played: {
      title: 'Пройденных игр пока нет',
      message: 'Нажми «+», чтобы добавить игру, в которую уже играл.',
    },
    filtered: {
      title: 'Ничего не найдено',
      message: 'Попробуй изменить запрос или сбросить поиск.',
    },
  },
  actions: {
    cancel: 'Отмена',
    delete: 'Удалить',
    ok: 'ОК',
    resetSearch: 'Сбросить поиск',
    save: 'Сохранить',
  },
  gameForm: {
    addTitle: 'Новая игра',
    editTitle: 'Редактирование игры',
    nameLabel: 'Название',
    namePlaceholder: 'Например, Hollow Knight',
    statusLabel: 'Статус',
    accessLabel: 'Доступ',
    platformLabel: 'Платформа',
    ratingLabel: 'Оценка',
    ratingHint: 'От 1 до 10, можно не ставить',
    ratingNotSet: 'Без оценки',
    noteLabel: 'Заметка',
    notePlaceholder: 'Мысли об игре, на чём остановился и так далее',
  },
  status: {
    wishlist: 'Хочу поиграть',
    available: 'Есть доступ',
    played: 'Играл',
  } satisfies Record<GameStatus, string>,
  access: {
    purchased: 'Куплено',
    friend: 'Есть у друга',
    subscription: 'В подписке',
  } satisfies Record<GameAccess, string>,
  platforms: {
    playstation: 'PlayStation',
  } satisfies Record<GamePlatform, string>,
  accessibility: {
    addGame: 'Добавить игру',
    back: 'Назад',
    clearSearch: 'Очистить поиск',
    deleteGame: 'Удалить игру',
    refreshData: 'Обновить данные',
    search: 'Поиск',
  },
  alerts: {
    emptyNameTitle: 'Нужно название',
    emptyNameMessage: 'Введи название игры, чтобы сохранить её.',
    loadTitle: 'Не удалось загрузить данные',
    loadMessage: 'Проверь подключение к интернету и попробуй ещё раз.',
    saveTitle: 'Не удалось сохранить',
    saveMessage: 'Проверь подключение к интернету и попробуй ещё раз.',
    deleteGameTitle: 'Удалить игру?',
    deleteGameMessage: (name: string) =>
      `Игра «${name}» будет удалена без возможности восстановления.`,
  },
  list: {
    loadError: 'Не удалось загрузить список игр.',
    ratingValue: (rating: number) => `Оценка: ${rating}/10`,
  },
};
