export const locales = ["en", "pt-BR"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function getLocaleLabel(locale: Locale): string {
  switch (locale) {
    case "en":
      return "EN";
    case "pt-BR":
      return "PT";
  }
}

export function getLocaleName(locale: Locale): string {
  switch (locale) {
    case "en":
      return "English";
    case "pt-BR":
      return "Português";
  }
}
