"use client";
import { useRef, useState } from "react";
import { useHorizontalWheel } from "@/shared/hooks/useHorizontalWheel";
import { HiChevronLeft, HiChevronRight, HiXMark } from "react-icons/hi2";
import { useLocalization } from "@/i18n/client";

export function AnimeGallery({ images, title }: { images: string[]; title: string }) {
  const { tui } = useLocalization();
  const stripRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState(0);
  useHorizontalWheel(stripRef);
  function step(direction: number) { setSelected(index => (index + direction + images.length) % images.length); }
  return <section className="anime-gallery" aria-labelledby="anime-gallery-heading">
    <div className="anime-section-heading"><h3 id="anime-gallery-heading">{tui("gallery")}</h3>{images.length > 0 && <span>{tui("frames", { n: images.length })}</span>}</div>
    {images.length ? <div className="anime-gallery-strip" ref={stripRef} tabIndex={0} aria-label={tui("gallery")}>
      {images.map((src, index) => <button type="button" key={`${src}:${index}`} aria-label={tui("frameAlt", { n: index + 1, title })} onClick={() => { setSelected(index); dialogRef.current?.showModal(); }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" decoding="async" />
      </button>)}
    </div> : <div className="anime-gallery-empty"><span>{tui("noFrames")}</span></div>}
    <dialog ref={dialogRef} className="gallery-viewer" aria-label={tui("gallery")} onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close(); }} onKeyDown={event => {
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
    }}>
      <div className="gallery-viewer-content">
        <header><span>{selected + 1} / {images.length}</span><button type="button" aria-label={tui("closeGallery")} onClick={() => dialogRef.current?.close()}><HiXMark /></button></header>
        {images.length > 0 && <div className="gallery-viewer-image">
          <button type="button" aria-label={tui("previousImage")} disabled={images.length < 2} onClick={() => step(-1)}><HiChevronLeft /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[selected]} alt={tui("frameAlt", { n: selected + 1, title })} />
          <button type="button" aria-label={tui("nextImage")} disabled={images.length < 2} onClick={() => step(1)}><HiChevronRight /></button>
        </div>}
      </div>
    </dialog>
  </section>;
}
