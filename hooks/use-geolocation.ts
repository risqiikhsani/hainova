"use client"

import { useState, useCallback } from "react"

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

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle")
  const [coords, setCoords] = useState<Coords | null>(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable")
      return
    }
    setStatus("loading")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setStatus("granted")
      },
      () => {
        setStatus("denied")
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }, [])

  return { status, coords, requestLocation }
}
