create extension if not exists pgcrypto;

create table if not exists public.flipbooks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  pdf_url text not null,
  theme text not null default 'dark-cinematic',
  created_at timestamp with time zone default now()
);

alter table public.flipbooks add column if not exists theme text not null default 'dark-cinematic';
alter table public.flipbooks add column if not exists pdf_url text;
alter table public.flipbooks alter column pdf_url set not null;

alter table public.flipbooks drop column if exists title;
alter table public.flipbooks drop column if exists customer_name;
alter table public.flipbooks drop column if exists teaser;
alter table public.flipbooks drop column if exists whatsapp_number;
alter table public.flipbooks drop column if exists watermark_text;
alter table public.flipbooks drop column if exists show_book_title;
alter table public.flipbooks drop column if exists show_teaser;
alter table public.flipbooks drop column if exists show_brand_logo;
alter table public.flipbooks drop column if exists show_brand_text;
alter table public.flipbooks drop column if exists show_customer_name;
alter table public.flipbooks drop column if exists show_demo_watermark;
alter table public.flipbooks drop column if exists show_whatsapp_button;
alter table public.flipbooks drop column if exists show_order_cta;

alter table public.flipbooks enable row level security;

drop policy if exists "Public can read flipbooks" on public.flipbooks;
create policy "Public can read flipbooks"
  on public.flipbooks
  for select
  using (true);

-- Create a public Storage bucket named "flipbook-pdfs".
-- Uploaded PDFs are stored inside books/{slug}.pdf.
