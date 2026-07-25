"use client"

import { MapPin, Star } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PlaceSummary } from "@/types/places"

const PRICE_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: "Free",
  PRICE_LEVEL_INEXPENSIVE: "$",
  PRICE_LEVEL_MODERATE: "$$",
  PRICE_LEVEL_EXPENSIVE: "$$$",
  PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
}

interface PlaceCardProps {
  place: PlaceSummary
  isSelected: boolean
  onClick: () => void
}

export function PlaceCard({ place, isSelected, onClick }: PlaceCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">
            {place.displayName.text}
          </CardTitle>
          {place.rating && (
            <Badge variant="secondary" className="shrink-0 gap-1">
              <Star className="size-3" />
              {place.rating.toFixed(1)}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-start gap-1 text-xs">
          <MapPin className="mt-0.5 size-3 shrink-0" />
          <span className="truncate">{place.formattedAddress}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex items-center gap-2">
        {place.primaryTypeDisplayName && (
          <Badge variant="outline" className="text-xs">
            {place.primaryTypeDisplayName.text}
          </Badge>
        )}
        {place.priceLevel && PRICE_LABELS[place.priceLevel] && (
          <Badge variant="outline" className="text-xs">
            {PRICE_LABELS[place.priceLevel]}
          </Badge>
        )}
        {place.userRatingCount && (
          <span className="ml-auto text-xs text-muted-foreground">
            {place.userRatingCount.toLocaleString()} reviews
          </span>
        )}
      </CardContent>
    </Card>
  )
}
