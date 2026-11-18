import type { Coordinates } from '../types/delivery'
import { DELIVERY_ROAD_FACTOR, METERS_PER_KILOMETER } from './constants'

const EARTH_RADIUS_KM = 6371
const DEGREES_IN_RADIANS = Math.PI / 180
const DISTANCE_DECIMAL_PLACES = 10

function toRadians(degrees: number): number {
  return degrees * DEGREES_IN_RADIANS
}

/** Great-circle distance between two coordinates, in kilometres. */
export function haversineDistanceKm(
  from: Coordinates,
  to: Coordinates,
): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude)
  const longitudeDelta = toRadians(to.longitude - from.longitude)
  const fromLatitude = toRadians(from.latitude)
  const toLatitude = toRadians(to.latitude)

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return (
    2 *
    EARTH_RADIUS_KM *
    Math.asin(Math.min(1, Math.sqrt(a)))
  )
}

/**
 * Estimated driving distance. The straight line is multiplied by a road factor
 * so the delivery fee and ETA reflect a realistic urban route.
 */
export function roadDistanceKm(from: Coordinates, to: Coordinates): number {
  const straightLine = haversineDistanceKm(from, to)
  return Number((straightLine * DELIVERY_ROAD_FACTOR).toFixed(DISTANCE_DECIMAL_PLACES))
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.max(
      0,
      Math.round(distanceKm * METERS_PER_KILOMETER),
    )
    return `${meters} m`
  }

  return `${distanceKm.toFixed(1).replace('.', ',')} km`
}
