'use client';

import { useMemo, useRef, useState } from 'react';
import '@/components/pdfjs-polyfill';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { ArrowLeft, ArrowRight, Expand, Loader2 } from 'lucide-react';
import type { Flipbook, ReadingTheme } from '@/lib/constants';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type FlipbookViewerProps = {
  book: Flipbook;
};

type FlipRef = {
  pageFlip: () => {
    flipNext: () => void;
    flipPrev: () => void;
  };
};

const themeClasses: Record<ReadingTheme, { shell: string; stage: string; controls: string; indicator: string }> = {
  'dark-cinematic': {
    shell: 'bg-ink/76 text-white shadow-glow',
    stage: 'border-bullion/18 bg-black/58',
    controls: 'border-white/12 bg-white/8 text-white hover:border-bullion',
    indicator: 'border-bullion/25 bg-bullion/10 text-bullion'
  },
  'light-clean': {
    shell: 'bg-white/86 text-ink shadow-2xl',
    stage: 'border-black/8 bg-slate-100',
    controls: 'border-black/10 bg-white text-ink hover:border-aurora',
    indicator: 'border-aurora/25 bg-aurora/10 text-aurora'
  },
  'premium-magazine': {
    shell: 'bg-[#101014]/84 text-white shadow-glow',
    stage: 'border-[#d8b46a]/25 bg-[#171412]',
    controls: 'border-[#d8b46a]/20 bg-[#d8b46a]/10 text-white hover:border-[#d8b46a]',
    indicator: 'border-[#d8b46a]/30 bg-[#d8b46a]/12 text-[#f4d28a]'
  }
};

export function FlipbookViewer({ book }: FlipbookViewerProps) {
  const flipRef = useRef<FlipRef | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [activePage, setActivePage] = useState(0);
  const [error, setError] = useState('');

  const theme = themeClasses[book.theme] ?? themeClasses['dark-cinematic'];
  const pages = useMemo(() => Array.from({ length: pageCount }, (_, index) => index + 1), [pageCount]);
  const pdfFile = useMemo(() => {
    if (book.pdf_url.startsWith('http')) {
      return book.pdf_url;
    }

    if (typeof window === 'undefined') {
      return book.pdf_url;
    }

    return new URL(book.pdf_url, window.location.origin).toString();
  }, [book.pdf_url]);

  function nextPage() {
    flipRef.current?.pageFlip().flipNext();
  }

  function previousPage() {
    flipRef.current?.pageFlip().flipPrev();
  }

  async function toggleFullscreen() {
    if (!stageRef.current) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await stageRef.current.requestFullscreen();
  }

  return (
    <section
      ref={stageRef}
      className={`relative grid min-h-[calc(100vh-24px)] content-center gap-4 rounded-lg border border-white/10 p-3 backdrop-blur-xl sm:min-h-[calc(100vh-48px)] sm:p-5 ${theme.shell}`}
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Fullscreen"
          className={`grid h-11 w-11 place-items-center rounded-md border transition ${theme.controls}`}
        >
          <Expand className="h-5 w-5" />
        </button>
      </div>

      <div className={`relative min-h-[420px] overflow-hidden rounded-md border px-1 py-5 sm:px-5 ${theme.stage}`}>
        <Document
          file={pdfFile}
          loading={
            <div className="relative z-10 grid min-h-[420px] place-items-center text-center">
              <div className="grid gap-4 justify-items-center">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="font-serif text-2xl font-black">Opening book</p>
              </div>
            </div>
          }
          error={
            <div className="relative z-10 grid min-h-[420px] place-items-center text-center text-red-100">
              Could not load this PDF.
            </div>
          }
          onLoadSuccess={({ numPages }) => {
            setPageCount(numPages);
            setError('');
          }}
          onLoadError={(loadError) => setError(loadError instanceof Error ? loadError.message : 'Could not load this PDF.')}
        >
          {pageCount > 0 && (
            <div className="relative z-10 mx-auto flex w-full max-w-[430px] justify-center">
              <HTMLFlipBook
                ref={flipRef}
                width={360}
                height={510}
                size="stretch"
                startPage={activePage}
                showCover={false}
                minWidth={260}
                maxWidth={430}
                minHeight={370}
                maxHeight={650}
                drawShadow
                flippingTime={820}
                usePortrait
                startZIndex={10}
                autoSize
                maxShadowOpacity={0.35}
                mobileScrollSupport
                clickEventForward
                useMouseEvents
                swipeDistance={24}
                showPageCorners
                disableFlipByClick={false}
                className="mx-auto"
                style={{}}
                onFlip={(event: { data: number }) => setActivePage(event.data)}
              >
                {pages.map((pageNumber) => (
                  <div key={pageNumber} className="flip-page relative overflow-hidden bg-white shadow-2xl">
                    <Page
                      pageNumber={pageNumber}
                      width={620}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      loading={
                        <div className="grid h-full min-h-[360px] place-items-center bg-white text-ink">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      }
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          )}
        </Document>

        {error && <p className="relative z-10 mt-4 text-center text-sm text-red-100">{error}</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previousPage}
          disabled={activePage <= 0}
          aria-label="Previous page"
          className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 font-bold transition disabled:opacity-40 ${theme.controls}`}
        >
          <ArrowLeft className="h-5 w-5" />
          Previous
        </button>
        <div className={`rounded-md border px-4 py-2 text-sm font-black ${theme.indicator}`}>
          {Math.min(activePage + 1, pageCount || 1)} / {pageCount || 1}
        </div>
        <button
          type="button"
          onClick={nextPage}
          disabled={pageCount > 0 && activePage >= pageCount - 1}
          aria-label="Next page"
          className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 font-bold transition disabled:opacity-40 ${theme.controls}`}
        >
          Next
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
