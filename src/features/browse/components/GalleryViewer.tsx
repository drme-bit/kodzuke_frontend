"use client";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

type Props = {
  gallery: string[];
  gIdx: number;
  setGIdx: (fn: number | ((v: number) => number)) => void;
  setLightbox: (v: boolean) => void;
};

export function GalleryViewer({ gallery, gIdx, setGIdx, setLightbox }: Props) {
  const activeSrc = gallery[gIdx];
  if (!gallery.length) return null;

  return (
    <div className="rounded-2xl bg-black/70 p-2 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      {/* preview of current gallery element */}
      <div className="group relative aspect-video overflow-hidden rounded-xl bg-zinc-900 ring-1 ring-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={activeSrc} src={activeSrc} alt="" className="h-full w-full object-cover" style={{ animation: "heroFade 480ms ease-out" }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <button onClick={() => setGIdx((v: number) => (v - 1 + gallery.length) % gallery.length)} className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur hover:bg-black/80 transition opacity-0 group-hover:opacity-100" aria-label="prev">
          <HiChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => setGIdx((v: number) => (v + 1) % gallery.length)} className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur hover:bg-black/80 transition opacity-0 group-hover:opacity-100" aria-label="next">
          <HiChevronRight className="h-4 w-4" />
        </button>
        <button onClick={() => setLightbox(true)} className="absolute bottom-1.5 right-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-black opacity-90 hover:bg-white transition">
          Открыть
        </button>
        <div className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur">
          {gIdx + 1} / {gallery.length}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-[0.14em] text-white/55">КАДРЫ</span>
        <span className="text-[10px] font-medium tracking-wide text-white/35">авто • {gallery.length}</span>
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {gallery.slice(0, 4).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setGIdx(i)}
            onMouseEnter={() => setGIdx(i)}
            className={`group relative flex-1 overflow-hidden rounded-xl ring-1 transition-all duration-300 ${gIdx === i ? "ring-white scale-[1.02] shadow-lg" : "ring-white/12 opacity-70 hover:opacity-100 hover:ring-white/25"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="aspect-[16/10] w-full object-cover" />
            {gIdx === i && <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white" />}
          </button>
        ))}
        {gallery.length > 4 && (
          <button onClick={() => setLightbox(true)} className="flex w-[56px] flex-col items-center justify-center gap-1 rounded-xl bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15 transition">
            <span className="text-xs font-bold">+{gallery.length - 4}</span>
            <span className="text-[10px] leading-none text-white/60">ещё</span>
          </button>
        )}
      </div>

      <div className="mt-2.5 h-px w-full overflow-hidden rounded-full bg-white/10">
        <div key={gIdx} className="h-full bg-white/60" style={{ animation: "galleryProgress 3500ms linear forwards" }} />
      </div>
    </div>
  );
}
