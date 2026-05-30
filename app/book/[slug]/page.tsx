import { notFound } from 'next/navigation';
import { FlipbookViewer } from '@/components/FlipbookViewer';
import type { Flipbook } from '@/lib/constants';
import { getLocalFlipbook } from '@/lib/local-flipbooks';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase-admin';

type BookPageProps = {
  params: {
    slug: string;
  };
};

async function getBook(slug: string) {
  if (!hasSupabaseConfig() && process.env.NODE_ENV !== 'production') {
    return getLocalFlipbook(slug);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('flipbooks').select('*').eq('slug', slug).single();

  if (error || !data) {
    return null;
  }

  return data as Flipbook;
}

export async function generateMetadata() {
  return {
    title: 'Digital Book',
    description: 'Read an immersive digital book.'
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBook(params.slug);

  if (!book) {
    notFound();
  }

  const pageTheme = {
    'dark-cinematic': 'bg-ink',
    'light-clean': 'bg-slate-100',
    'premium-magazine': 'bg-[#080706]'
  }[book.theme];

  return (
    <main className={`min-h-screen overflow-hidden px-3 py-3 sm:px-6 sm:py-6 ${pageTheme}`}>
      <div className="relative mx-auto max-w-7xl">
        <FlipbookViewer book={book} />
      </div>
    </main>
  );
}
