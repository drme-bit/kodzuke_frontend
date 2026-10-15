"use client";
import { useLocalization } from "@/i18n/client";
import { useId, useState } from "react";
export function AnimeDescription({ text }: { text?: string }) {
  const { tui } = useLocalization();
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  if (!text) return null;
  return <div className="anime-description-block">
    <p id={id} className={`anime-description${expanded ? " expanded" : ""}`}>{text}</p>
    <button className="anime-description-toggle" type="button" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>{expanded ? tui("hideDescription") : tui("showDescription")}</button>
  </div>;
}
