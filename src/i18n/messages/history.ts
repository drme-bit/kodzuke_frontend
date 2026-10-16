import { normalizeLocale } from "@/i18n";
const en = {
  inProgress: "In progress",
  continue: "Continue watching",
  completed: "Watched",
  all: "All history",
  details: "Episode history",
  mark: "Mark episode watched",
  remove: "Remove from history",
  undo: "Undo",
  removed: "Removed from history",
  empty: "No unfinished episodes",
  emptyHint:
    "Watch an episode for at least 20 seconds and it will appear here.",
  error: "Could not update history. Please try again.",
  unknown: "Progress unavailable",
  watched: "Episode watched",
};
const ru: typeof en = {
  inProgress: "Не завершено",
  continue: "Продолжить просмотр",
  completed: "Просмотренные",
  all: "Вся история",
  details: "История серий",
  mark: "Отметить серию просмотренной",
  remove: "Убрать из истории",
  undo: "Отменить",
  removed: "Убрано из истории",
  empty: "Нет незавершённых серий",
  emptyHint: "Посмотрите серию хотя бы 20 секунд — она появится здесь.",
  error: "Не удалось обновить историю. Попробуйте ещё раз.",
  unknown: "Прогресс недоступен",
  watched: "Серия просмотрена",
};
const uk: typeof en = {
  inProgress: "Незавершені",
  continue: "Продовжити перегляд",
  completed: "Переглянуті",
  all: "Уся історія",
  details: "Історія епізодів",
  mark: "Позначити епізод переглянутим",
  remove: "Прибрати з історії",
  undo: "Скасувати",
  removed: "Прибрано з історії",
  empty: "Немає незавершених епізодів",
  emptyHint: "Перегляньте епізод хоча б 20 секунд — він з’явиться тут.",
  error: "Не вдалося оновити історію. Спробуйте ще раз.",
  unknown: "Прогрес недоступний",
  watched: "Епізод переглянуто",
};
export const historyCopy = (locale: string) =>
  ({ en, ru, uk })[normalizeLocale(locale)];
