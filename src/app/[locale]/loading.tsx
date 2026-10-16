import { ContentSkeleton } from "@/shared/ui/ContentSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1600px] px-6 py-8" aria-busy="true">
      <ContentSkeleton player />
    </main>
  );
}
