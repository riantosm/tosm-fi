export interface LanguageOption {
  code: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "id", nativeLabel: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "en", nativeLabel: "English", flag: "🇬🇧" },
  { code: "jp", nativeLabel: "日本語", flag: "🇯🇵" },
];
