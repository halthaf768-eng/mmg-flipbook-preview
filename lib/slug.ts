export function slugify(input: string) {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || 'flipbook'}-${suffix}`;
}
