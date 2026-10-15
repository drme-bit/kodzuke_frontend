"use client";
import { useEffect, type RefObject } from "react";
/** Convert vertical mouse wheels without interfering with zoom or horizontal trackpads. */
export function useHorizontalWheel(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 0 || !event.deltaY) return;
      const unit = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? element.clientWidth : 1;
      event.preventDefault();
      element.scrollLeft = Math.max(0, Math.min(max, element.scrollLeft + event.deltaY * unit));
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [ref]);
}
