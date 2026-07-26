'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { usePlaceDetails, useEmbedUrl } from '@/hooks/use-places';
import {
  PlaceDetailPanel,
  PlaceDetailSkeleton,
} from '@/app/maps/_components/place-detail-panel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PlaceDetailModalProps {
  placeId: string | null;
  onClose: () => void;
}

export function PlaceDetailModal({ placeId, onClose }: PlaceDetailModalProps) {
  const {
    place,
    isLoading: detailsLoading,
    error: detailsError,
    fetchDetails,
  } = usePlaceDetails();

  const {
    src: embedSrc,
    isLoading: embedLoading,
    error: embedError,
    fetchEmbedUrl,
  } = useEmbedUrl();

  useEffect(() => {
    if (placeId) {
      fetchDetails(placeId);
      fetchEmbedUrl(placeId);
    }
  }, [placeId, fetchDetails, fetchEmbedUrl]);

  if (!placeId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-2xl p-4 md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted/80 hover:bg-muted text-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {detailsLoading ? (
          <PlaceDetailSkeleton />
        ) : detailsError ? (
          <Alert variant="destructive">
            <AlertDescription>{detailsError}</AlertDescription>
          </Alert>
        ) : place ? (
          <PlaceDetailPanel
            place={place}
            embedSrc={embedSrc}
            embedLoading={embedLoading}
            embedError={embedError}
          />
        ) : null}
      </div>
    </div>
  );
}
