import type { Coordinates } from '../types/delivery'

export const CART_STORAGE_KEY = '@coffee-delivery:cart-state-1.0.0'
export const THEME_STORAGE_KEY = '@coffee-delivery:theme-1.0.0'
export const LAST_ORDER_STORAGE_KEY = '@coffee-delivery:last-order-1.0.0'

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const STORE_NAME = 'Coffee Delivery'
export const STORE_ADDRESS_LINE = 'Rua dos Andradas, 1234'
export const STORE_ADDRESS_DETAILS = 'Centro Histórico · Porto Alegre — RS'
export const STORE_CEP = '90020008'
export const STORE_CITY = 'Porto Alegre'
export const STORE_STATE = 'RS'
export const STORE_HOURS = 'Todos os dias, das 8h às 22h'
export const STORE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Rua+dos+Andradas+1234+Centro+Historico+Porto+Alegre+RS'

/** Geocoded from Rua dos Andradas, 1234 — Centro Histórico, Porto Alegre. */
export const STORE_COORDINATES: Coordinates = {
  latitude: -30.029495,
  longitude: -51.229538,
}

/* ------------------------------------------------------------------ */
/*  Delivery                                                           */
/* ------------------------------------------------------------------ */

export const DELIVERY_MAX_DISTANCE_KM = 12
export const DELIVERY_ROAD_FACTOR = 1.25
export const DELIVERY_SPEED_KM_H = 24
export const DELIVERY_PREP_MINUTES = 12
export const DELIVERY_BUFFER_MINUTES = 5
export const DELIVERY_WINDOW_MINUTES = 10
export const DELIVERY_ROUNDING_MINUTES = 5
export const DELIVERY_CITY_FALLBACK_DISTANCE_KM = 2.5
export const METERS_PER_KILOMETER = 1000

export interface DeliveryFeeTier {
  readonly maxDistanceKm: number
  readonly feeInCents: number
}

/** Road distance tiers measured from the store. The last tier is the limit. */
export const DELIVERY_FEE_TIERS: readonly DeliveryFeeTier[] = [
  { maxDistanceKm: 1.5, feeInCents: 350 },
  { maxDistanceKm: 4, feeInCents: 590 },
  { maxDistanceKm: 8, feeInCents: 890 },
  { maxDistanceKm: DELIVERY_MAX_DISTANCE_KM, feeInCents: 1290 },
]

/* ------------------------------------------------------------------ */
/*  Payments                                                           */
/* ------------------------------------------------------------------ */

export const PAYMENT_SIMULATION_DELAY_MS = 1800
export const PAYMENT_STEP_INTERVAL_MS = 600
export const PAYMENT_DECLINE_CARD_SUFFIX = '0002'
export const PIX_KEY = '11998102527'
export const MAX_INSTALLMENTS = 6
export const CARD_CVV_LENGTH = 4

/* ------------------------------------------------------------------ */
/*  UI                                                                 */
/* ------------------------------------------------------------------ */

export const TOAST_DURATION_MS = 4500
export const HEADER_SCROLL_THRESHOLD_PX = 8
