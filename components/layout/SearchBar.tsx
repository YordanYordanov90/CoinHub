'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  onOpen?: () => void;
}

export default function SearchBar({ onOpen }: SearchBarProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      aria-label="Open search"
    >
      <Search className="size-4" aria-hidden="true" />
      Search
    </button>
  );
}
