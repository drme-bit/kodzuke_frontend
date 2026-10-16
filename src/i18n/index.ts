import { normalizeLocale } from "./config";
import { messages } from "./messages/landing";
export { locales, defaultLocale, normalizeLocale, type Locale } from "./config";
export function getMessages(locale: string) {
  return messages[normalizeLocale(locale)];
}
