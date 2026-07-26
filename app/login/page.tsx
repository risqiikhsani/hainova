"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Eye, EyeOff, Lock, Loader2, ShieldCheck, AlertCircle, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the website password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Incorrect password. Access denied.");
        setIsLoading(false);
        return;
      }

      // Refresh router and navigate to target page
      router.push(returnTo);
      router.refresh();
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Connection error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="website-password"
            className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Website Password
          </label>
          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <input
              id="website-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              autoFocus
              required
              disabled={isLoading}
              className="w-full rounded-xl border border-input bg-background/50 pl-9 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !password.trim()}
          className="w-full rounded-xl py-2.5 text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 size-4" />
              Unlock Access
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-12 overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Decorative Ambient Gradients */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Top Header Controls (Theme Toggle) */}
      <div className="absolute top-4 right-4 z-20">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-5 text-amber-400" />
            ) : (
              <Moon className="size-5 text-slate-700" />
            )}
          </Button>
        )}
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10 transition-transform hover:scale-105">
            <Compass className="size-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Hainova Access
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              This site is protected. Please enter the password to unlock access.
            </p>
          </div>
        </div>

        {/* Login Form Container with Suspense boundary */}
        <React.Suspense
          fallback={
            <div className="flex justify-center items-center rounded-2xl border border-border/60 bg-card/80 p-8 shadow-xl backdrop-blur-xl">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground">
          Configured via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">WEBSITE_PASSWORD</code> environment variable.
        </p>
      </div>
    </div>
  );
}
