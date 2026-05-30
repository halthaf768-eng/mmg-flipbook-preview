export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024;
export const STORAGE_BUCKET = 'flipbook-pdfs';

export const READING_THEMES = ['dark-cinematic', 'light-clean', 'premium-magazine'] as const;

export type ReadingTheme = (typeof READING_THEMES)[number];

export type Flipbook = {
  id: string;
  slug: string;
  pdf_url: string;
  theme: ReadingTheme;
  created_at: string;
};

export function isReadingTheme(value: string): value is ReadingTheme {
  return READING_THEMES.includes(value as ReadingTheme);
}
