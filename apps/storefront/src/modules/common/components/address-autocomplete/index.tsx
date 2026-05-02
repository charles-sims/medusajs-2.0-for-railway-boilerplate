"use client"

import React, { useEffect, useRef, useCallback } from "react"

type AddressComponents = {
  address_1: string
  city: string
  province: string
  postal_code: string
  country_code: string
}

type AddressAutocompleteProps = {
  name: string
  label: string
  value?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddressSelect: (address: AddressComponents) => void
  required?: boolean
  "data-testid"?: string
}

declare global {
  interface Window {
    __googleMapsCallback?: () => void
    google?: typeof google
  }
}

/**
 * Loads the Google Maps Places script once globally.
 * Returns a promise that resolves when the API is ready.
 */
function loadGooglePlaces(): Promise<void> {
  if (window.google?.maps?.places) return Promise.resolve()

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
  if (!apiKey) return Promise.reject(new Error("Missing NEXT_PUBLIC_GOOGLE_PLACES_API_KEY"))

  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already loading — wait for callback
      const prev = window.__googleMapsCallback
      window.__googleMapsCallback = () => {
        prev?.()
        resolve()
      }
      return
    }

    window.__googleMapsCallback = () => resolve()

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=__googleMapsCallback`
    script.async = true
    script.defer = true
    script.onerror = () => reject(new Error("Failed to load Google Maps"))
    document.head.appendChild(script)
  })
}

/**
 * Parses Google Place address_components into a flat object.
 */
function parsePlace(
  place: google.maps.places.PlaceResult
): AddressComponents {
  const get = (type: string) =>
    place.address_components?.find((c) => c.types.includes(type))

  const streetNumber = get("street_number")?.long_name ?? ""
  const route = get("route")?.long_name ?? ""

  return {
    address_1: `${streetNumber} ${route}`.trim(),
    city:
      get("locality")?.long_name ??
      get("sublocality_level_1")?.long_name ??
      get("postal_town")?.long_name ??
      "",
    province:
      get("administrative_area_level_1")?.short_name ?? "",
    postal_code: get("postal_code")?.long_name ?? "",
    country_code:
      get("country")?.short_name?.toLowerCase() ?? "",
  }
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  name,
  label,
  value,
  onChange,
  onAddressSelect,
  required,
  "data-testid": dataTestId,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const initialized = useRef(false)

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.address_components) return

    const parsed = parsePlace(place)
    onAddressSelect(parsed)
  }, [onAddressSelect])

  useEffect(() => {
    if (initialized.current || !inputRef.current) return

    loadGooglePlaces()
      .then(() => {
        if (!inputRef.current || !window.google) return
        initialized.current = true

        autocompleteRef.current =
          new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ["address"],
            fields: ["address_components"],
          })

        autocompleteRef.current.addListener(
          "place_changed",
          handlePlaceChanged
        )
      })
      .catch(() => {
        // Graceful degradation — works as a plain text input
      })

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [handlePlaceChanged])

  return (
    <div className="flex flex-col w-full">
      <div className="flex relative z-0 w-full txt-compact-medium">
        <input
          ref={inputRef}
          type="text"
          name={name}
          placeholder=" "
          required={required}
          autoComplete="address-line1"
          className="pt-4 pb-1 block w-full h-11 px-4 mt-0 bg-ui-bg-field border rounded-md appearance-none focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active border-ui-border-base hover:bg-ui-bg-field-hover"
          value={value ?? ""}
          onChange={onChange}
          data-testid={dataTestId}
        />
        <label
          htmlFor={name}
          onClick={() => inputRef.current?.focus()}
          className="flex items-center justify-center mx-3 px-1 transition-all absolute duration-300 top-3 -z-1 origin-0 text-ui-fg-subtle"
        >
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      </div>
    </div>
  )
}

export default AddressAutocomplete
