'use client';
import { useState } from 'react';

export function CopyButton({ text, className = '' }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 select-none
        ${copied
          ? 'border-emerald-500 text-emerald-400 bg-emerald-950'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 bg-zinc-900'
        } ${className}`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}
