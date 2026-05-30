import { Loader2 } from 'lucide-react';

export default function BookLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="relative grid justify-items-center gap-5 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-white/8">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
        <p className="font-serif text-3xl font-black text-white">Opening book</p>
      </div>
    </main>
  );
}
