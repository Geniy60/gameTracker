import type { GameAccess, GamePlatform, MainTab } from './types';

export const strings = {
  app: {
    title: 'GameTracker',
  },
  // Short labels: three tabs share one row, so longer names do not fit.
  tabs: {
    wishlist: 'Хочу',
    available: 'Есть',
    played: 'Играл',
  } satisfies Record<MainTab, string>,
  search: {
    games: 'Поиск игры',
  },
  empty: {
    wishlist: {
      title: 'Список желаний пуст',
      message: 'Здесь будут игры, к которым пока нет доступа, но поиграть хочется.',
    },
    available: {
      title: 'Доступных игр пока нет',
      message: 'Здесь будут игры, к которым есть доступ: купленные, из подписки или у друга.',
    },
    played: {
      title: 'Пройденных игр пока нет',
      message: 'Здесь будут игры, в которые ты уже играл, даже если доступ к ним пропал.',
    },
    filtered: {
      title: 'Ничего не найдено',
      message: 'Попробуй изменить запрос или сбросить поиск.',
    },
  } satisfies Record<MainTab | 'filtered', { message: string; title: string }>,
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
    accessLabel: 'Доступ',
    accessNone: 'Нет доступа',
    playedLabel: 'Играл в неё',
    playedNo: 'Ещё нет',
    playedYes: 'Играл',
    platformLabel: 'Платформа',
    ratingLabel: 'Оценка',
    ratingNotSet: 'Без оценки',
    noteLabel: 'Заметка',
    notePlaceholder: 'Мысли об игре, на чём остановился и так далее',
  },
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
    playedMark: 'Играл',
    ratingValue: (rating: number) => `Оценка: ${rating}/10`,
  },
};
