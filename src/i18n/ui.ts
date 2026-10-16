import { normalizeLocale } from "./config";
import { uiMessages } from "./messages/common";
import { pluralForms } from "./messages/plurals";
export type UiKey = keyof typeof uiMessages.en;
export function translator(locale: string) {
  const messages = uiMessages[normalizeLocale(locale)];
  return (key: UiKey, values: Record<string, string | number> = {}) => {
    let message: string = messages[key];
    if (
      (key === "titles" ||
        key === "seasonCount" ||
        key === "frames" ||
        key === "results") &&
      typeof values.n === "number"
    ) {
      const category = new Intl.PluralRules(normalizeLocale(locale)).select(
        values.n,
      );
      const word =
        pluralForms[normalizeLocale(locale)][key][
          category === "one" ? 0 : category === "few" ? 1 : 2
        ];
      message = "{n} " + word;
    }
    return message.replace(/\{(\w+)\}/g, (_, name: string) =>
      String(values[name] ?? ""),
    );
  };
}
