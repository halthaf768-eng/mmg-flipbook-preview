import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-serif text-4xl font-black text-white">Book not found</h1>
        <p className="mt-3 text-white/68">This reading link is missing or no longer available.</p>
        <Link
          href="/admin"
          className="mt-6 inline-flex min-h-11 items-center rounded-md border border-bullion/50 px-5 font-bold text-bullion transition hover:bg-bullion hover:text-ink"
        >
          Back to admin
        </Link>
      </div>
    </main>
  );
}
