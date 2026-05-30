import { AdminUploadForm } from '@/components/AdminUploadForm';

export default function AdminPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-ink/80">
      <div className="halftone pointer-events-none fixed inset-0 opacity-45" />
      <section className="relative mx-auto grid min-h-screen w-full max-w-4xl content-center gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-rise-in">
          <h1 className="max-w-3xl font-serif text-4xl font-black leading-tight text-white sm:text-6xl">
            Create a reading link.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
            Upload a PDF, choose a reading atmosphere, and open it as an immersive flipbook.
          </p>
        </div>

        <div className="animate-rise-in rounded-lg border border-white/12 bg-ink/78 p-4 shadow-glow backdrop-blur-xl sm:p-6">
          <AdminUploadForm />
        </div>
      </section>
    </main>
  );
}
