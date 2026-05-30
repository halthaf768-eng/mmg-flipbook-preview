import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Flipbook, ReadingTheme } from '@/lib/constants';

const publicDir = path.join(process.cwd(), 'public');
const uploadDir = path.join(publicDir, 'local-flipbooks');
const dataDir = path.join(process.cwd(), '.local-data');
const dataFile = path.join(dataDir, 'flipbooks.json');

async function readLocalFlipbooks() {
  try {
    const file = await readFile(dataFile, 'utf8');
    return JSON.parse(file) as Flipbook[];
  } catch {
    return [];
  }
}

async function writeLocalFlipbooks(flipbooks: Flipbook[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(flipbooks, null, 2));
}

export async function saveLocalFlipbook(input: {
  slug: string;
  theme: ReadingTheme;
  pdf: File;
}) {
  await mkdir(uploadDir, { recursive: true });

  const bytes = Buffer.from(await input.pdf.arrayBuffer());
  await writeFile(path.join(uploadDir, `${input.slug}.pdf`), bytes);

  const flipbook: Flipbook = {
    id: crypto.randomUUID(),
    slug: input.slug,
    pdf_url: `/local-flipbooks/${input.slug}.pdf`,
    theme: input.theme,
    created_at: new Date().toISOString()
  };

  const existing = await readLocalFlipbooks();
  await writeLocalFlipbooks([flipbook, ...existing.filter((book) => book.slug !== input.slug)]);

  return flipbook;
}

export async function getLocalFlipbook(slug: string) {
  const flipbooks = await readLocalFlipbooks();
  const book = flipbooks.find((entry) => entry.slug === slug);

  if (!book) {
    return null;
  }

  return {
    id: book.id,
    slug: book.slug,
    pdf_url: book.pdf_url,
    theme: book.theme ?? 'dark-cinematic',
    created_at: book.created_at
  } satisfies Flipbook;
}
