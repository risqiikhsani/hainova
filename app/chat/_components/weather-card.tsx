'use client';

import {
  CloudSun,
  Sun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  Loader2,
  MapPin,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GetWeatherInput {
  city?: string;
  units?: 'metric' | 'imperial';
}

export interface GetWeatherOutput {
  location?: string;
  temperature?: string;
  feelsLike?: string;
  tempMin?: string;
  tempMax?: string;
  condition?: string;
  description?: string;
  humidity?: string;
  windSpeed?: string;
  cloudiness?: string;
  error?: string;
}

interface WeatherCardProps {
  input?: GetWeatherInput;
  output?: GetWeatherOutput | null;
  state: string;
  errorText?: string;
}

function getWeatherTheme(condition?: string) {
  const cond = condition?.toLowerCase() || '';

  if (cond.includes('clear') || cond.includes('sun')) {
    return {
      Icon: Sun,
      iconColor: 'text-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      cardBg: 'from-amber-500/10 via-background to-orange-500/5 border-amber-500/30',
      glowBg: 'bg-amber-500/20',
    };
  }
  if (cond.includes('rain') || cond.includes('shower')) {
    return {
      Icon: CloudRain,
      iconColor: 'text-sky-500',
      badgeBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      cardBg: 'from-sky-500/10 via-background to-blue-600/5 border-sky-500/30',
      glowBg: 'bg-sky-500/20',
    };
  }
  if (cond.includes('drizzle')) {
    return {
      Icon: CloudDrizzle,
      iconColor: 'text-cyan-500',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
      cardBg: 'from-cyan-500/10 via-background to-blue-500/5 border-cyan-500/30',
      glowBg: 'bg-cyan-500/20',
    };
  }
  if (cond.includes('thunder') || cond.includes('storm') || cond.includes('lightning')) {
    return {
      Icon: CloudLightning,
      iconColor: 'text-purple-500',
      badgeBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      cardBg: 'from-purple-500/10 via-background to-amber-500/5 border-purple-500/30',
      glowBg: 'bg-purple-500/20',
    };
  }
  if (cond.includes('snow') || cond.includes('ice') || cond.includes('flurry')) {
    return {
      Icon: CloudSnow,
      iconColor: 'text-blue-300',
      badgeBg: 'bg-blue-300/10 text-blue-400 border-blue-300/20',
      cardBg: 'from-blue-400/10 via-background to-slate-500/5 border-blue-400/30',
      glowBg: 'bg-blue-400/20',
    };
  }
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze') || cond.includes('smoke')) {
    return {
      Icon: CloudFog,
      iconColor: 'text-slate-400',
      badgeBg: 'bg-slate-400/10 text-slate-500 border-slate-400/20',
      cardBg: 'from-slate-500/10 via-background to-slate-400/5 border-slate-500/30',
      glowBg: 'bg-slate-400/20',
    };
  }
  if (cond.includes('cloud')) {
    return {
      Icon: Cloud,
      iconColor: 'text-sky-400',
      badgeBg: 'bg-sky-400/10 text-sky-600 dark:text-sky-400 border-sky-400/20',
      cardBg: 'from-sky-400/10 via-background to-indigo-500/5 border-sky-400/30',
      glowBg: 'bg-sky-400/20',
    };
  }

  return {
    Icon: CloudSun,
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    cardBg: 'from-amber-500/10 via-background to-sky-500/5 border-amber-500/30',
    glowBg: 'bg-amber-500/20',
  };
}

export function WeatherCard({ input, output, state, errorText }: WeatherCardProps) {
  const isError = state === 'output-error' || !!output?.error;
  const errorMessage = output?.error || errorText || 'Weather lookup failed';
  const cityName = input?.city || 'Location';

  const theme = getWeatherTheme(output?.condition);
  const { Icon, iconColor, badgeBg, cardBg, glowBg } = theme;

  return (
    <div className="mb-3 space-y-2.5">
      {/* Header status bar */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-background/70 border border-border/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <CloudSun className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
          {state === 'output-available' && !isError ? (
            <span className="truncate">
              Retrieved weather for <strong className="text-foreground">{output?.location || cityName}</strong>
            </span>
          ) : isError ? (
            <span className="text-destructive truncate">Weather lookup failed: {errorMessage}</span>
          ) : (
            <span className="flex items-center gap-1.5 truncate">
              <Loader2 className="h-3 w-3 animate-spin text-amber-500 shrink-0" />
              Fetching weather data for <strong className="text-foreground">{cityName}</strong>...
            </span>
          )}
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Weather Content Card */}
      {state === 'output-available' && !isError && output && (
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-xs transition-all',
            cardBg
          )}
        >
          {/* Background Ambient Glow */}
          <div
            className={cn(
              'absolute -top-10 -right-10 h-32 w-32 rounded-full blur-2xl opacity-60 pointer-events-none',
              glowBg
            )}
          />

          {/* Top Row: Location & Condition Badge */}
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-foreground font-semibold text-base">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{output.location || cityName}</span>
              </div>
              {output.description && (
                <p className="text-xs text-muted-foreground capitalize font-medium">
                  {output.description}
                </p>
              )}
            </div>

            {output.condition && (
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', badgeBg)}>
                {output.condition}
              </span>
            )}
          </div>

          {/* Hero Section: Temp & Big Icon */}
          <div className="my-4 flex items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {output.temperature}
                </span>
              </div>

              {output.feelsLike && (
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <span>Feels like</span>
                  <span className="text-foreground font-semibold">{output.feelsLike}</span>
                </p>
              )}
            </div>

            {/* Weather Icon Box */}
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-background/80 border border-border/60 shadow-sm backdrop-blur-xs">
              <Icon className={cn('h-9 w-9 transition-transform hover:scale-110', iconColor)} />
            </div>
          </div>

          {/* Min / Max Temperature pill if available */}
          {(output.tempMin || output.tempMax) && (
            <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground font-medium relative z-10">
              {output.tempMax && (
                <span className="inline-flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-emerald-500" />
                  High: <strong className="text-foreground">{output.tempMax}</strong>
                </span>
              )}
              {output.tempMin && (
                <span className="inline-flex items-center gap-1">
                  <ArrowDown className="h-3 w-3 text-sky-500" />
                  Low: <strong className="text-foreground">{output.tempMin}</strong>
                </span>
              )}
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/40 relative z-10">
            {output.feelsLike && (
              <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/40 p-2 text-xs">
                <Thermometer className="h-4 w-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Feels Like</p>
                  <p className="font-semibold text-foreground truncate">{output.feelsLike}</p>
                </div>
              </div>
            )}

            {output.humidity && (
              <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/40 p-2 text-xs">
                <Droplets className="h-4 w-4 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Humidity</p>
                  <p className="font-semibold text-foreground truncate">{output.humidity}</p>
                </div>
              </div>
            )}

            {output.windSpeed && (
              <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/40 p-2 text-xs">
                <Wind className="h-4 w-4 text-teal-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Wind</p>
                  <p className="font-semibold text-foreground truncate">{output.windSpeed}</p>
                </div>
              </div>
            )}

            {output.cloudiness && (
              <div className="flex items-center gap-2 rounded-xl bg-background/60 border border-border/40 p-2 text-xs">
                <Cloud className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground font-medium leading-tight">Clouds</p>
                  <p className="font-semibold text-foreground truncate">{output.cloudiness}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
