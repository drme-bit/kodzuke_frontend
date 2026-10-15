"use client";
import { useId, useRef, useState } from "react";
import { HiXMark } from "react-icons/hi2";
export function AnimeInfoDialog({ title, description, meta, gallery = [], trailerUrl }: { title: string; description?: string; meta?: string; gallery?: string[]; trailerUrl?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [tab, setTab] = useState("description");
  return <>
    <button type="button" className="cinema-info-button" onClick={() => dialog.current?.showModal()}>Подробнее</button>
    <dialog ref={dialog} className="cinema-info-dialog" aria-labelledby={id} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <div className="cinema-info-body">
        <button type="button" className="cinema-info-close" aria-label="Закрыть информацию" onClick={() => dialog.current?.close()}><HiXMark /></button>
        <h2 id={id}>{title}</h2><p className="cinema-info-meta">{meta}</p>
        <div className="cinema-info-tabs" aria-label="Разделы информации">
          <button type="button" aria-pressed={tab === "description"} onClick={() => setTab("description")}>Описание</button>
          {gallery.length > 0 && <button type="button" aria-pressed={tab === "gallery"} onClick={() => setTab("gallery")}>Кадры</button>}
          {trailerUrl && <button type="button" aria-pressed={tab === "trailer"} onClick={() => setTab("trailer")}>Трейлер</button>}
        </div>
        {tab === "description" && <p className="cinema-info-description">{description || "Описание пока не добавлено."}</p>}
        {tab === "gallery" && <div className="cinema-info-gallery">{gallery.map((url, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} key={`${url}-${index}`} alt={`Кадр ${index + 1}`} loading="lazy" />
        ))}</div>}
        {tab === "trailer" && trailerUrl && <a href={trailerUrl} target="_blank" rel="noreferrer" className="cinema-trailer-link">Смотреть трейлер</a>}
      </div>
    </dialog>
  </>;
}
