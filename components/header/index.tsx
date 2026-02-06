"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { Coins, Home, MenuIcon, Search, X, ChevronRight, TrendingUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { navItems } from "@/constants"
import SearchModal from "@/components/search-model"

const iconByHref: Record<string, LucideIcon> = {
  "/": Home,
  "/search": Search,
  "/coins": Coins,
  "/predictions": TrendingUp,
}

const Header = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobilePanelRef = useRef<HTMLDivElement | null>(null)

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on Escape + focus management
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    // focus the panel for immediate keyboard access
    mobilePanelRef.current?.focus()

    return () => {
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) return
    // return focus to the menu button when closing
    menuButtonRef.current?.focus()
  }, [isOpen])

  const NavLink = ({
    href,
    label,
    icon: Icon,
    isMobile,
    className,
    onNavigate,
  }: {
    href: string
    label: string
    icon?: LucideIcon
    isMobile?: boolean
    className?: string
    onNavigate?: () => void
  }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md",
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent/50",
          isMobile &&
            cn(
              "w-full justify-between py-3 px-4 text-base rounded-lg hover:bg-accent",
              isActive && "bg-accent text-foreground"
            ),
          className
        )}
      >
        <span className="inline-flex items-center gap-3">
          {Icon && <Icon className={cn(isMobile ? "size-5" : "size-4")} aria-hidden="true" />}
          <span>{label}</span>
        </span>
        {isMobile && (
          <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
        )}
        {isActive && (
          <span
            className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full"
            aria-hidden
          />
        )}
      </Link>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
        >
          <Image
            src="/coinhub1.png"
            alt="CoinHub"
            width={125}
            height={40}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) =>
            item.href === "/search" ? (
              <button
                key={item.href}
                type="button"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md",
                  "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                )}
                aria-label="Open search"
              >
                <Search className="size-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            ) : (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={iconByHref[item.href]}
              />
            )
          )}
        </nav>

        {/* Mobile: search + menu */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open search"
          >
            <Search className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            ref={menuButtonRef}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <X className="size-5" />
            ) : (
              <MenuIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile nav overlay */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          isOpen ? "visible" : "invisible"
        )}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          aria-label="Close menu"
        />

        {/* Slide-in panel */}
        <div
          ref={mobilePanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          tabIndex={-1}
          className={cn(
            "absolute top-0 right-0 h-full w-[min(22rem,88vw)] bg-card border-l border-border shadow-xl outline-none transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border p-4">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Go to home"
            >
              <Image src="/coinhub1.png" alt="CoinHub" width={110} height={36} />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex flex-col gap-1 p-3">
            {navItems.map((item) =>
              item.href === "/search" ? (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    setSearchOpen(true)
                  }}
                  className={cn(
                    "relative flex w-full items-center justify-between gap-2 py-3 px-4 text-base rounded-lg",
                    "text-muted-foreground hover:bg-accent hover:text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label="Open search"
                >
                  <span className="inline-flex items-center gap-3">
                    <Search className="size-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                </button>
              ) : (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={iconByHref[item.href]}
                  isMobile
                  onNavigate={() => setIsOpen(false)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
