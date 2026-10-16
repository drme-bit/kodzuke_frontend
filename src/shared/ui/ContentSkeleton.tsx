/** Server-rendered fallback; reserves space while a streamed section loads. */
export function ContentSkeleton({ player = false }: { player?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={
        player
          ? "player-loading h-[calc(100dvh-80px)] min-h-[480px] w-full bg-white/[0.025]"
          : "min-h-36 w-full rounded bg-white/[0.025]"
      }
    />
  );
}
