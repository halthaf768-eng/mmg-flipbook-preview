'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, FileUp, Loader2, Sparkles } from 'lucide-react';
import { MAX_PDF_SIZE_BYTES, type ReadingTheme } from '@/lib/constants';

type SubmitState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; link: string }
  | { status: 'error'; message: string };

const themes: Array<{ value: ReadingTheme; label: string }> = [
  { value: 'dark-cinematic', label: 'Dark cinematic' },
  { value: 'light-clean', label: 'Light clean' },
  { value: 'premium-magazine', label: 'Premium magazine' }
];

export function AdminUploadForm() {
  const [state, setState] = useState<SubmitState>({ status: 'idle' });
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileLabel = useMemo(() => {
    if (!selectedFile) {
      return 'Choose PDF';
    }

    const mb = selectedFile.size / (1024 * 1024);
    return `${selectedFile.name} - ${mb.toFixed(1)}MB`;
  }, [selectedFile]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied(false);
    setState({ status: 'loading' });

    const form = event.currentTarget;
    const formData = new FormData(form);
    const pdf = formData.get('pdf');

    if (!(pdf instanceof File) || pdf.size === 0) {
      setState({ status: 'error', message: 'Please choose a PDF to upload.' });
      return;
    }

    const isPdf = pdf.type === 'application/pdf' || pdf.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setState({ status: 'error', message: 'Only PDF files are supported.' });
      return;
    }

    if (pdf.size > MAX_PDF_SIZE_BYTES) {
      setState({ status: 'error', message: 'The PDF must be 50MB or smaller.' });
      return;
    }

    try {
      const response = await fetch('/api/admin/flipbooks', {
        method: 'POST',
        body: formData
      });
      const payload = (await response.json()) as { error?: string; publicLink?: string };

      if (!response.ok || !payload.publicLink) {
        throw new Error(payload.error || 'Unable to generate the reading link.');
      }

      setState({ status: 'success', link: payload.publicLink });
      form.reset();
      setSelectedFile(null);
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unable to generate the reading link.'
      });
    }
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-bullion">Admin password</span>
        <input
          name="adminKey"
          type="password"
          required
          className="rounded-md border border-white/10 bg-white/8 px-4 py-3 text-white outline-none ring-bullion/40 transition focus:ring-4"
          placeholder="Enter admin key"
        />
      </label>

      <label className="group grid cursor-pointer gap-2">
        <span className="text-sm font-semibold text-bullion">Upload PDF</span>
        <span className="flex min-h-16 items-center gap-3 rounded-md border border-dashed border-aurora/60 bg-aurora/10 px-4 py-4 text-sm text-white/82 transition group-hover:border-bullion group-hover:bg-bullion/10">
          <FileUp className="h-5 w-5 text-bullion" />
          {fileLabel}
        </span>
        <input
          name="pdf"
          type="file"
          accept="application/pdf,.pdf"
          required
          className="sr-only"
          onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
        />
      </label>

      <fieldset className="grid gap-3">
        <legend className="mb-1 text-sm font-semibold text-bullion">Select theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {themes.map((theme, index) => (
            <label
              key={theme.value}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/6 px-4 text-sm font-bold text-white/86 transition has-[:checked]:border-bullion has-[:checked]:bg-bullion/14"
            >
              <input
                name="theme"
                type="radio"
                value={theme.value}
                defaultChecked={index === 0}
                className="h-4 w-4 accent-bullion"
              />
              {theme.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={state.status === 'loading'}
        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-bullion px-5 py-3 font-black uppercase tracking-wide text-ink shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state.status === 'loading' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        Generate Link
      </button>

      {state.status === 'error' && (
        <div className="rounded-md border border-red-400/40 bg-red-500/12 px-4 py-3 text-sm text-red-100">
          {state.message}
        </div>
      )}

      {state.status === 'success' && (
        <div className="grid gap-3 rounded-md border border-bullion/40 bg-bullion/10 p-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-bullion">Reading link</span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={state.link} className="break-all text-white underline decoration-bullion/70 underline-offset-4">
              {state.link}
            </a>
            <button
              type="button"
              onClick={() => copyLink(state.link)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-white/14 px-4 text-sm font-bold text-white transition hover:border-bullion"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
