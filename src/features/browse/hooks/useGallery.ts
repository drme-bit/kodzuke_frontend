"use client";
import { useCallback, useEffect, useState, type SetStateAction } from "react";

export function useGallery(gallery: string[], activeId?: string) {
  const [selection, setSelection] = useState({ activeId, index: 0 });
  const [lightbox, setLightbox] = useState(false);
  const gIdx = selection.activeId === activeId && selection.index < gallery.length ? selection.index : 0;
  const setGIdx = useCallback((value: SetStateAction<number>) => {
    setSelection(previous => {
      const index = previous.activeId === activeId && previous.index < gallery.length ? previous.index : 0;
      return { activeId, index: typeof value === "function" ? value(index) : value };
    });
  }, [activeId, gallery.length]);
  useEffect(() => {
    if (gallery.length <= 1 || lightbox) return;
    const id = setInterval(() => setGIdx(value => (value + 1) % gallery.length), 3500);
    return () => clearInterval(id);
  }, [gallery.length, lightbox, setGIdx]);
  return { gIdx, setGIdx, lightbox, setLightbox };
}
