export interface Coordinates {
  latitude: number
  longitude: number
}

export interface DeliveryQuote {
  distanceKm: number
  feeInCents: number
  minMinutes: number
  maxMinutes: number
  /** True when the address could not be geocoded and the city fallback was used. */
  estimated: boolean
  calculatedAt: string
}

export type DeliveryQuoteResult =
  | { status: 'available'; quote: DeliveryQuote }
  | { status: 'out-of-area'; distanceKm?: number }

export type DeliveryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; quote: DeliveryQuote }
  | { status: 'out-of-area'; distanceKm?: number }
