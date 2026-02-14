"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from '@/types/api';
import { useSearchCoins } from '@/lib/hooks/useSearchCoins';
import CoinImage from '@/components/ui/CoinImage';

const MIN_QUERY_LENGTH = 2;
const RECENT_STORAGE_KEY = "coinhub-recent-search-coins";
const RECENT_MAX = 5;

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResultCoin = SearchResult['coins'][number];

function getRecentCoins(): SearchResultCoin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SearchResultCoin[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function addRecentCoin(coin: SearchResultCoin) {
  try {
    const recent = getRecentCoins().filter((c) => c.id !== coin.id);
    const next = [coin, ...recent].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmedQuery = query.trim();
  const shouldFetch = isOpen && trimmedQuery.length >= MIN_QUERY_LENGTH;
  const { data, error, isLoading } = useSearchCoins(query, isOpen);

  const coins = useMemo(() => data?.coins ?? [], [data?.coins]);
  const apiError = data?.error;
  const queryErrorMessage = error instanceof Error ? error.message : undefined;
  const showHint = !shouldFetch && !isLoading;
  const showResults = shouldFetch && !error && !apiError;
  const list = useMemo(
    () => (showResults ? coins : []),
    [showResults, coins],
  );
  const hasList = list.length > 0;
  const recentCoins = isOpen ? getRecentCoins() : [];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const handleSelectCoin = useCallback(
    (coin: SearchResultCoin) => {
      addRecentCoin(coin);
      handleClose();
    },
    [handleClose],
  );

  // Keyboard: Escape, ArrowUp, ArrowDown, Enter
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          setQuery("");
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (hasList ? (prev < list.length - 1 ? prev + 1 : 0) : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (hasList ? (prev > 0 ? prev - 1 : list.length - 1) : 0));
          break;
        case "Enter":
          if (hasList && list[selectedIndex]) {
            e.preventDefault();
            handleSelectCoin(list[selectedIndex]);
          }
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose, hasList, list, selectedIndex, handleSelectCoin]);

  // Reset selected index when list changes (defer to avoid sync setState in effect)
  useEffect(() => {
    const id = setTimeout(() => setSelectedIndex(0), 0);
    return () => clearTimeout(id);
  }, [trimmedQuery, list.length]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="fixed inset-0 z-100 bg-black/40 backdrop-blur-xl transition-opacity supports-backdrop-filter:bg-black/30"
        aria-label="Close search"
      />
      <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] pointer-events-none">
        <div
          className="w-full max-w-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Search cryptocurrencies"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5 mx-4">
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cryptocurrencies..."
                className="flex-1 bg-transparent py-4 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label="Search coins"
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <kbd className="hidden rounded-md border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground sm:inline-block">
                ESC
              </kbd>
            </div>

            {/* Recent (when no query) */}
            {!query && recentCoins.length > 0 && (
              <div className="border-b border-border px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentCoins.map((coin) => (
                    <Link
                      key={coin.id}
                      href={`/coins/${coin.id}`}
                      onClick={handleClose}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
                    >
                      {coin.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Results / hint / loading / error */}
            <div className="max-h-[400px] overflow-y-auto">
              <div className="px-4 py-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {query ? (
                    <>
                      <Search className="h-3 w-3" />
                      Results
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3" />
                      Trending
                    </>
                  )}
                </div>

                {showHint && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Type at least {MIN_QUERY_LENGTH} characters to search.
                  </p>
                )}
                {isLoading && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Searching...
                  </p>
                )}
                {(error || apiError) && (
                  <p className="py-6 text-center text-sm text-destructive">
                    {apiError ?? queryErrorMessage ?? "Search failed."}
                  </p>
                )}
                {showResults && coins.length === 0 && (
                  <p className="py-8 text-center text-muted-foreground">
                    No results found for &quot;{query}&quot;
                  </p>
                )}
                {showResults && coins.length > 0 && (
                  <div className="space-y-1">
                    {coins.map((coin, index) => (
                      <Link
                        key={coin.id}
                        href={`/coins/${coin.id}`}
                        onClick={() => handleSelectCoin(coin)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left transition-colors",
                          selectedIndex === index
                            ? "bg-primary/10 text-foreground"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <CoinImage
                            src={coin.thumb}
                            alt=""
                            width={40}
                            height={40}
                            className="rounded-full shrink-0"
                          />
                          <div>
                            <div className="font-medium">{coin.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {coin.symbol.toUpperCase()}
                              {coin.market_cap_rank != null && (
                                <span className="ml-1">#{coin.market_cap_rank}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {selectedIndex === index && (
                          <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↑</kbd>
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-border bg-card px-1.5 py-0.5">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-card px-1.5 py-0.5">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
