"use client"

import { create } from "zustand"

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "unavailable"

export interface Coords {
  lat: number
  lng: number
}

interface GeolocationState {
  status: GeolocationStatus
  coords: Coords | null
  requestLocation: () => void
}

export const useGeolocationStore = create<GeolocationState>((set, get) => ({
  status: "idle",
  coords: null,
  requestLocation: () => {
    if (get().status === "loading") return

    if (typeof window === "undefined" || !navigator?.geolocation) {
      set({ status: "unavailable" })
      return
    }

    set({ status: "loading" })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          coords: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          },
          status: "granted",
        })
      },
      () => {
        set({ status: "denied" })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  },
}))

export function useGeolocation() {
  const status = useGeolocationStore((s) => s.status)
  const coords = useGeolocationStore((s) => s.coords)
  const requestLocation = useGeolocationStore((s) => s.requestLocation)

  return { status, coords, requestLocation }
}
