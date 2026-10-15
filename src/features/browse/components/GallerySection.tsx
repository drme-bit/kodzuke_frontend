"use client";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

type Props = {
  gallery: string[];
  gIdx: number;
  setGIdx: (value: number | ((previous: number) => number)) => void;
  setLightbox: (v: boolean) => void;
};

export function GallerySection({ gallery, gIdx, setGIdx, setLightbox }: Props) {
  if (!gallery.length) return null;
  const active = gallery[gIdx];
  return (
    <section className="mx-auto mt-6 max-w-[1600px]">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="text-[13px] font-bold tracking-[0.12em] text-white/70">ГАЛЕРЕЯ</h3>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/60">
          {gIdx + 1} / {gallery.length}
        </span>
      </div>

      <div className="mt-3 rounded-[20px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur md:p-3">
        {/* large preview */}
        <div className="group relative aspect-[16/9] overflow-hidden rounded-2xl bg-zinc-900 md:aspect-[2.35/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={active} src={active} alt="" className="h-full w-full object-cover" style={{ animation: "heroFade 480ms ease-out" }} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <button
            onClick={() => setGIdx((v: number) => (v - 1 + gallery.length) % gallery.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 hidden rounded-full bg-black/60 p-2.5 text-white backdrop-blur hover:bg-black/80 transition group-hover:flex md:flex"
            aria-label="prev"
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setGIdx((v: number) => (v + 1) % gallery.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded-full bg-black/60 p-2.5 text-white backdrop-blur hover:bg-black/80 transition group-hover:flex md:flex"
            aria-label="next"
          >
            <HiChevronRight className="h-5 w-5" />
          </button>
          <button onClick={() => setLightbox(true)} className="absolute bottom-3 right-3 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black hover:bg-white transition">
            Открыть
          </button>
        </div>

        {/* thumbnails full */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setGIdx(i)}
              onMouseEnter={() => setGIdx(i)}
              className={`relative shrink-0 overflow-hidden rounded-xl ring-1 transition-all duration-300 ${gIdx === i ? "ring-white" : "ring-white/10 opacity-60 hover:opacity-100 hover:ring-white/30"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-20 w-32 object-cover md:h-[88px] md:w-40" />
              {gIdx === i && <span className="pointer-events-none absolute inset-0 ring-2 ring-white rounded-xl" />}
            </button>
          ))}
        </div>

        <div className="mt-3 h-px w-full overflow-hidden rounded-full bg-white/10">
          <div key={gIdx} className="h-full bg-white/60" style={{ animation: "galleryProgress 3500ms linear forwards" }} />
        </div>
      </div>
      <style>{`@keyframes galleryProgress { from { width: 0% } to { width: 100% } } @keyframes heroFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </section>
  );
}
