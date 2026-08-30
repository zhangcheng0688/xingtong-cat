"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { key: "practice", label: "演练", icon: "✦", path: "/home" },
  { key: "learn", label: "学习", icon: "❋", path: "/learn" },
  { key: "community", label: "社区", icon: "❍", path: "/community" },
  { key: "me", label: "我的", icon: "☾", path: "/me" },
];

export default function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-mist/80 bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="grid grid-cols-4">
        {TABS.map((t) => {
          const active = pathname === t.path || pathname.startsWith(t.path + "/");
          return (
            <button
              key={t.key}
              onClick={() => router.push(t.path)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition ${
                active ? "text-stardeep" : "text-inklight/70"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className={`text-[11px] ${active ? "font-bold" : "font-medium"}`}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
