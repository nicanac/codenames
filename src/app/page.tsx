'use client';

import dynamic from 'next/dynamic';

const CodenamesGame = dynamic(() => import('../components/CodenamesGame'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-mono text-sm">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        <span>Chargement de la mission...</span>
      </div>
    </div>
  ),
});

export default function Page() {
  return <CodenamesGame />;
}
