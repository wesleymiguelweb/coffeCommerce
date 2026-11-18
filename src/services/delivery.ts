import type {
  DeliveryQuote,
  DeliveryQuoteResult,
} from '../types/delivery'
import {
  DELIVERY_BUFFER_MINUTES,
  DELIVERY_CITY_FALLBACK_DISTANCE_KM,
  DELIVERY_FEE_TIERS,
  DELIVERY_MAX_DISTANCE_KM,
  DELIVERY_PREP_MINUTES,
  DELIVERY_ROUNDING_MINUTES,
  DELIVERY_SPEED_KM_H,
  DELIVERY_WINDOW_MINUTES,
  STORE_CITY,
  STORE_COORDINATES,
  STORE_STATE,
} from '../utils/constants'
import { roadDistanceKm } from '../utils/geo'

const MINUTES_PER_HOUR = 60
const DISTANCE_DECIMAL_PLACES = 2

interface QuoteOptions {
  estimated?: boolean
  now?: Date
}

interface DeliveryAddressLike {
  city: string
  state: string
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function isSameStoreCity(address: DeliveryAddressLike): boolean {
  return (
    normalizeText(address.city) === normalizeText(STORE_CITY) &&
    address.state.trim().toUpperCase() === STORE_STATE
  )
}

function findFeeInCents(distanceKm: number): number {
  const tier = DELIVERY_FEE_TIERS.find(
    (candidate) => distanceKm <= candidate.maxDistanceKm,
  )
  return tier?.feeInCents ?? DELIVERY_FEE_TIERS[DELIVERY_FEE_TIERS.length - 1].feeInCents
}

function calculateEta(distanceKm: number): { min: number; max: number } {
  const travelMinutes = (distanceKm / DELIVERY_SPEED_KM_H) * MINUTES_PER_HOUR
  const rawMinutes =
    DELIVERY_PREP_MINUTES + travelMinutes + DELIVERY_BUFFER_MINUTES
  const min = Math.ceil(rawMinutes / DELIVERY_ROUNDING_MINUTES) * DELIVERY_ROUNDING_MINUTES

  return { min, max: min + DELIVERY_WINDOW_MINUTES }
}

/**
 * Turns a road distance into a delivery quote. Distances beyond the last fee
 * tier are refused instead of silently charging the highest price.
 */
export function buildDeliveryQuote(
  distanceKm: number,
  { estimated = false, now = new Date() }: QuoteOptions = {},
): DeliveryQuoteResult {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return { status: 'out-of-area' }
  }

  if (distanceKm > DELIVERY_MAX_DISTANCE_KM) {
    return {
      status: 'out-of-area',
      distanceKm: Number(distanceKm.toFixed(DISTANCE_DECIMAL_PLACES)),
    }
  }

  const roundedDistance = Number(
    distanceKm.toFixed(DISTANCE_DECIMAL_PLACES),
  )

  const eta = calculateEta(roundedDistance)
  const quote: DeliveryQuote = {
    distanceKm: roundedDistance,
    feeInCents: findFeeInCents(distanceKm),
    minMinutes: eta.min,
    maxMinutes: eta.max,
    estimated,
    calculatedAt: now.toISOString(),
  }

  return { status: 'available', quote }
}

export function quoteFromCoordinates(
  coordinates: { latitude: number; longitude: number },
  now?: Date,
): DeliveryQuoteResult {
  const distanceKm = roadDistanceKm(STORE_COORDINATES, coordinates)
  return buildDeliveryQuote(distanceKm, { estimated: false, now })
}

/**
 * Fallback used when the CEP has no coordinates. It still checks that the
 * address belongs to the store city, and flags the quote as an estimate so the
 * UI can be transparent with the customer.
 */
export function cityFallbackQuote(
  address: DeliveryAddressLike,
  now?: Date,
): DeliveryQuoteResult {
  if (!isSameStoreCity(address)) {
    return { status: 'out-of-area' }
  }

  return buildDeliveryQuote(DELIVERY_CITY_FALLBACK_DISTANCE_KM, {
    estimated: true,
    now,
  })
}
