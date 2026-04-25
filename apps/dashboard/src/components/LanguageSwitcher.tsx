'use client';

import { useRouter } from 'next/navigation';

export function LanguageSwitcher({ current }: { current: string }) {
  const router = useRouter();

  function set(locale: string) {
    document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5 border border-[#e5e7eb]/15 rounded-lg overflow-hidden text-xs font-medium">
      {(['en', 'de'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => set(lang)}
          className={`px-2.5 py-1.5 uppercase transition-colors ${
            current === lang
              ? 'bg-[#e5e7eb]/10 text-white'
              : 'text-[#e5e7eb]/40 hover:text-white hover:bg-[#e5e7eb]/5'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
