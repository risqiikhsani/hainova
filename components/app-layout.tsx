"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Home,
  Bot,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon,
  LocateFixed,
  Loader2,
  LocateOff,
  CheckCircle2,
  RotateCw,
} from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useGeolocation } from "@/hooks/use-geolocation"

const NAV_ITEMS = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "AI Chat",
    href: "/chat",
    icon: Bot,
    badge: "AI",
  },
  {
    name: "Maps & Places",
    href: "/maps",
    icon: MapPin,
  },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { status: geoStatus, coords, requestLocation } = useGeolocation()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  // Location UI Component for Sidebar
  function SidebarLocationSection({ isCollapsed = false }: { isCollapsed?: boolean }) {
    if (geoStatus === "granted" && coords) {
      if (isCollapsed) {
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={requestLocation}
            className="w-full text-emerald-500 hover:text-emerald-600 dark:text-emerald-400"
            title={`Location Active: ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)} (Click to refresh)`}
          >
            <CheckCircle2 className="size-4" />
          </Button>
        )
      }

      return (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>Location Active</span>
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={requestLocation}
              className="size-5 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
              title="Refresh location"
            >
              <RotateCw className="size-3" />
            </Button>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground font-mono">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </div>
      )
    }

    if (geoStatus === "loading") {
      if (isCollapsed) {
        return (
          <div className="flex justify-center p-2 text-primary" title="Detecting location...">
            <Loader2 className="size-4 animate-spin" />
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin text-primary shrink-0" />
          <span className="truncate">Locating you...</span>
        </div>
      )
    }

    if (geoStatus === "denied") {
      if (isCollapsed) {
        return (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={requestLocation}
            className="w-full text-destructive"
            title="Location access blocked (Click to retry)"
          >
            <LocateOff className="size-4" />
          </Button>
        )
      }

      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-destructive">
            <LocateOff className="size-3.5 shrink-0" />
            <span>Location Blocked</span>
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={requestLocation}
            className="mt-2 w-full text-[10px]"
          >
            Try Again
          </Button>
        </div>
      )
    }

    // Idle state (or unavailable)
    if (isCollapsed) {
      return (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={requestLocation}
          className="w-full text-muted-foreground hover:text-primary"
          title="Use My Location"
        >
          <LocateFixed className="size-4 text-primary" />
        </Button>
      )
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={requestLocation}
        className="w-full justify-start gap-2 text-xs font-medium border-primary/20 hover:border-primary/40 hover:bg-primary/5"
      >
        <LocateFixed className="size-3.5 text-primary shrink-0" />
        <span className="truncate">Use Location</span>
      </Button>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Left Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border/60 bg-sidebar transition-all duration-300 relative z-30 shrink-0",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center justify-between px-3 border-b border-border/40">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 overflow-hidden transition-all",
              collapsed && "justify-center w-full"
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Compass className="size-4" />
            </div>
            {!collapsed && (
              <span className="font-bold text-base tracking-tight text-sidebar-foreground truncate">
                Hainova
              </span>
            )}
          </Link>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCollapsed(true)}
              className="text-muted-foreground hover:text-foreground"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {collapsed && (
          <div className="flex justify-center py-2 border-b border-border/30">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setCollapsed(false)}
              className="text-muted-foreground hover:text-foreground"
              title="Expand Sidebar"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {/* Location Button on Top of Nav Links */}
          <div className="px-1">
            <SidebarLocationSection isCollapsed={collapsed} />
          </div>

          {/* Navigation Items */}
          <div className="space-y-1">
            <div
              className={cn(
                "px-2 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider",
                collapsed && "sr-only"
              )}
            >
              Navigation
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-colors relative group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-xs font-semibold"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive
                        ? "text-sidebar-primary-foreground"
                        : "text-primary"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
                        isActive
                          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-border/40 p-2 space-y-1">
          {/* Dark mode toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size={collapsed ? "icon-sm" : "sm"}
              onClick={toggleTheme}
              className={cn(
                "w-full text-xs text-muted-foreground hover:text-foreground justify-start gap-2.5",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? "Toggle Theme" : undefined}
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="size-4 text-slate-700 dark:text-slate-300 shrink-0" />
              )}
              {!collapsed && (
                <span className="truncate">
                  {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </Button>
          )}

          {!collapsed && (
            <div className="px-2.5 py-1.5 text-[10px] text-muted-foreground/70 flex items-center justify-between border-t border-border/20 mt-1">
              <span>Hainova v0.1</span>
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[9px]">
                d
              </kbd>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Nav Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="size-4" />
          </div>
          <span className="font-bold text-sm">Hainova</span>
        </Link>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
              {resolvedTheme === "dark" ? (
                <Sun className="size-4 text-amber-400" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-64 max-w-[80vw] flex-col bg-sidebar border-r border-border/60 p-4 shadow-xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Compass className="size-4" />
                </div>
                <span className="font-bold text-base">Hainova</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto">
              {/* Location section in mobile drawer */}
              <SidebarLocationSection isCollapsed={false} />

              <div className="space-y-1">
                <div className="px-2 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Navigation
                </div>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                      )}
                    >
                      <Icon className="size-4 shrink-0 text-primary" />
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-primary">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 mt-auto text-xs text-muted-foreground">
              <p className="text-[11px] font-medium text-foreground">
                Hainova Hub
              </p>
              <p className="text-[10px]">Location AI & Google Places</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
