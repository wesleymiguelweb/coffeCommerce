import type { Coordinates } from '../types/delivery'
import { normalizeCep } from '../utils/cep'

const BRASIL_API_BASE_URL = 'https://brasilapi.com.br/api/cep/v2'
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search'
const COORDINATE_TIMEOUT_MS = 7000
const MIN_LATITUDE = -90
const MAX_LATITUDE = 90
const MIN_LONGITUDE = -180
const MAX_LONGITUDE = 180
const NOMINATIM_RESULT_LIMIT = '1'

export interface CoordinateLookupAddress {
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseCoordinate(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(',', '.'))
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function toCoordinates(
  latitudeValue: unknown,
  longitudeValue: unknown,
): Coordinates | null {
  const latitude = parseCoordinate(latitudeValue)
  const longitude = parseCoordinate(longitudeValue)

  if (latitude === null || longitude === null) return null
  if (latitude < MIN_LATITUDE || latitude > MAX_LATITUDE) return null
  if (longitude < MIN_LONGITUDE || longitude > MAX_LONGITUDE) return null

  return { latitude, longitude }
}

function createSignal(signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(COORDINATE_TIMEOUT_MS)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

function readBrasilApiCoordinates(
  payload: unknown,
): Coordinates | null {
  if (!isRecord(payload)) return null

  const location = payload.location
  if (!isRecord(location)) return null

  const coordinates = location.coordinates
  if (!isRecord(coordinates)) return null

  return toCoordinates(coordinates.latitude, coordinates.longitude)
}

async function fetchBrasilApiCoordinates(
  cep: string,
  signal?: AbortSignal,
): Promise<Coordinates | null> {
  try {
    const response = await fetch(`${BRASIL_API_BASE_URL}/${cep}`, {
      signal: createSignal(signal),
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) return null

    return readBrasilApiCoordinates(await response.json())
  } catch {
    return null
  }
}

function readNominatimCoordinates(payload: unknown): Coordinates | null {
  if (!Array.isArray(payload) || payload.length === 0) return null

  const first: unknown = payload[0]
  if (!isRecord(first)) return null

  return toCoordinates(first.lat, first.lon)
}

async function fetchNominatimCoordinates(
  address: CoordinateLookupAddress,
  signal?: AbortSignal,
): Promise<Coordinates | null> {
  const query = [
    `${address.street}, ${address.number}`,
    address.neighborhood,
    `${address.city} - ${address.state}`,
    address.cep,
    'Brasil',
  ]
    .filter((part) => part.trim() !== '')
    .join(', ')

  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: NOMINATIM_RESULT_LIMIT,
    countrycodes: 'br',
    'accept-language': 'pt-BR',
    q: query,
  })

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}?${params.toString()}`, {
      signal: createSignal(signal),
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) return null

    return readNominatimCoordinates(await response.json())
  } catch {
    return null
  }
}

/**
 * Resolves a Brazilian CEP to coordinates. BrasilAPI is the primary source;
 * Nominatim geocodes the full address when the CEP database has no point.
 */
export async function fetchCepCoordinates(
  cep: string,
  address: CoordinateLookupAddress,
  signal?: AbortSignal,
): Promise<Coordinates | null> {
  const digits = normalizeCep(cep)
  if (digits.length !== 8) return null

  const byCep = await fetchBrasilApiCoordinates(digits, signal)
  if (byCep) return byCep
  if (signal?.aborted) return null

  return fetchNominatimCoordinates(address, signal)
}
