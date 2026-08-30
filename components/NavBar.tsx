"use client";

import { useRouter } from "next/navigation";

export default function NavBar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-mist/60 bg-cream/95 px-4 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-full text-inklight transition hover:bg-mist/60"
          aria-label="返回"
        >
          ←
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-[17px] font-semibold text-night">{title}</div>
          {subtitle && <div className="truncate text-xs text-inklight">{subtitle}</div>}
        </div>
        {right}
      </div>
    </header>
  );
}
