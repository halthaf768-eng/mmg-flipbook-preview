import { NextResponse } from 'next/server';
import { MAX_PDF_SIZE_BYTES, STORAGE_BUCKET, isReadingTheme, type Flipbook } from '@/lib/constants';
import { saveLocalFlipbook } from '@/lib/local-flipbooks';
import { slugify } from '@/lib/slug';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase-admin';
import { getSiteUrl } from '@/lib/url';

export const runtime = 'nodejs';

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    const configuredAdminKey = process.env.ADMIN_KEY;
    if (!configuredAdminKey) {
      return jsonError('Admin access is not configured.', 500);
    }

    const formData = await request.formData();
    const adminKey = textValue(formData, 'adminKey');
    const themeValue = textValue(formData, 'theme');
    const theme = isReadingTheme(themeValue) ? themeValue : 'dark-cinematic';
    const pdf = formData.get('pdf');

    if (adminKey !== configuredAdminKey) {
      return jsonError('Invalid admin password.', 401);
    }

    if (!(pdf instanceof File)) {
      return jsonError('A PDF file is required.');
    }

    const isPdf = pdf.type === 'application/pdf' || pdf.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return jsonError('Only PDF uploads are allowed.');
    }

    if (pdf.size > MAX_PDF_SIZE_BYTES) {
      return jsonError('PDF must be 50MB or smaller.');
    }

    const slug = slugify(pdf.name.replace(/\.pdf$/i, '') || 'book');
    const publicLink = `${getSiteUrl()}/book/${slug}`;

    if (!hasSupabaseConfig() && process.env.NODE_ENV !== 'production') {
      const flipbook = await saveLocalFlipbook({ slug, theme, pdf });
      return NextResponse.json({ flipbook, publicLink, mode: 'local-dev' });
    }

    const storagePath = `books/${slug}.pdf`;
    const supabase = getSupabaseAdmin();
    const upload = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, pdf, {
      contentType: 'application/pdf',
      cacheControl: '3600',
      upsert: false
    });

    if (upload.error) {
      return jsonError(upload.error.message, 500);
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

    const insert = await supabase
      .from('flipbooks')
      .insert({
        slug,
        pdf_url: publicUrl,
        theme
      })
      .select('*')
      .single();

    if (insert.error) {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      return jsonError(insert.error.message, 500);
    }

    return NextResponse.json({ flipbook: insert.data as Flipbook, publicLink });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Something went wrong.';
    return jsonError(message, 500);
  }
}
