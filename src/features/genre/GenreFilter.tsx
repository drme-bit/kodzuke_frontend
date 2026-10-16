"use client";

import { useRef, useState } from "react";
import type { Genre } from "@/dto";
import { genreCopy } from "@/i18n/messages/genres";
import { genreName } from "@/i18n/genres";

export function GenreFilter({
  genres,
  selected,
  onChange,
  locale,
}: {
  genres: Genre[];
  selected: string[];
  onChange: (slugs: string[]) => void;
  locale: string;
}) {
  const [search, setSearch] = useState("");
  const details = useRef<HTMLDetailsElement>(null);
  const copy = genreCopy(locale);
  const options = [...genres]
    .sort((a, b) =>
      genreName(a, locale).localeCompare(genreName(b, locale), locale),
    )
    .filter((genre) =>
      genreName(genre, locale)
        .toLocaleLowerCase(locale)
        .includes(search.trim().toLocaleLowerCase(locale)),
    );
  return (
    <div className="genre-filter-row">
      <details
        ref={details}
        className="genre-filter"
        onKeyDown={(event) => {
          if (event.key === "Escape" && details.current) {
            details.current.open = false;
            details.current.querySelector("summary")?.focus();
          }
        }}
      >
        <summary>
          {copy.label}
          {selected.length > 0 && <span>{selected.length}</span>}
        </summary>
        <div className="genre-filter-menu">
          <input
            type="search"
            aria-label={copy.search}
            placeholder={copy.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="genre-filter-options">
            {options.map((genre) => (
              <label key={genre.slug}>
                <input
                  type="checkbox"
                  checked={selected.includes(genre.slug)}
                  onChange={(event) =>
                    onChange(
                      event.target.checked
                        ? [...selected, genre.slug]
                        : selected.filter((slug) => slug !== genre.slug),
                    )
                  }
                />
                <span>{genreName(genre, locale)}</span>
              </label>
            ))}
            {!options.length && <p role="status">{copy.empty}</p>}
          </div>
        </div>
      </details>
      {selected.map((slug) => {
        const genre = genres.find((genre) => genre.slug === slug);
        return (
          <button
            key={slug}
            className="genre-filter-selected"
            aria-label={`${copy.remove}: ${genre ? genreName(genre, locale) : slug}`}
            onClick={() => onChange(selected.filter((value) => value !== slug))}
          >
            {genre ? genreName(genre, locale) : slug}
            <span aria-hidden="true">×</span>
          </button>
        );
      })}
      {selected.length > 1 && <small>{copy.all}</small>}
    </div>
  );
}
