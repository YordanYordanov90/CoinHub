"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import  { useState, useEffect } from "react"
import { MenuIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search-model", label: "Search Model" },
  { href: "/coins", label: "Coins" },
] as const

const Header = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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

  const NavLink = ({
    href,
    label,
    className,
    onNavigate,
  }: {
    href: string
    label: string
    className?: string
    onNavigate?: () => void
  }) => {
    const isActive = pathname === href
    return (
      <Link
        href={href}
        onClick={onNavigate}
        className={cn(
          "relative block px-3 py-2 text-sm font-medium transition-colors rounded-md",
          "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent/50",
          className
        )}
      >
        {label}
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
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
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
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex md:hidden size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className={cn(
            "absolute top-0 right-0 h-full w-[min(20rem,85vw)] bg-card border-l border-border shadow-xl transition-transform duration-200 ease-out",
            isOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex flex-col gap-1 p-4 pt-14">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                className="py-3 px-4 text-base rounded-lg"
                onNavigate={() => setIsOpen(false)}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
