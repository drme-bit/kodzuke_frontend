import { normalizeLocale } from "@/i18n";
const en = {
  edit: "Edit profile",
  username: "Display name",
  avatar: "Avatar URL",
  avatarHint: "HTTPS image URL. Leave empty to use your initials.",
  description: "About you",
  save: "Save changes",
  cancel: "Cancel",
  success: "Profile updated",
  error: "Could not save your profile. Please try again.",
  taken: "This name is already taken.",
  invalid: "Use a name of 3–32 characters and a valid HTTPS avatar URL.",
  latest: "Latest episode ratings",
  emptyRatings: "No episode ratings yet",
};
const ru: typeof en = {
  edit: "Редактировать профиль",
  username: "Имя",
  avatar: "Ссылка на аватар",
  avatarHint: "HTTPS-ссылка на изображение. Оставьте пустой для инициалов.",
  description: "О себе",
  save: "Сохранить",
  cancel: "Отмена",
  success: "Профиль обновлён",
  error: "Не удалось сохранить профиль. Попробуйте ещё раз.",
  taken: "Это имя уже занято.",
  invalid:
    "Имя должно содержать 3–32 символа, а ссылка на аватар — начинаться с HTTPS.",
  latest: "Последние оценки серий",
  emptyRatings: "Пока нет оценок серий",
};
const uk: typeof en = {
  edit: "Редагувати профіль",
  username: "Ім’я",
  avatar: "Посилання на аватар",
  avatarHint: "HTTPS-посилання на зображення. Залиште порожнім для ініціалів.",
  description: "Про себе",
  save: "Зберегти",
  cancel: "Скасувати",
  success: "Профіль оновлено",
  error: "Не вдалося зберегти профіль. Спробуйте ще раз.",
  taken: "Це ім’я вже зайняте.",
  invalid:
    "Ім’я має містити 3–32 символи, а посилання на аватар — починатися з HTTPS.",
  latest: "Останні оцінки епізодів",
  emptyRatings: "Оцінок епізодів поки немає",
};
export const profileCopy = (locale: string) =>
  ({ en, ru, uk })[normalizeLocale(locale)];
