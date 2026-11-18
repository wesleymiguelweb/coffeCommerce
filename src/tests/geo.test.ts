import { describe, it, expect } from 'vitest'
import type { Coordinates } from '../types/delivery'
import { DELIVERY_ROAD_FACTOR, STORE_COORDINATES } from '../utils/constants'
import {
  formatDistance,
  haversineDistanceKm,
  roadDistanceKm,
} from '../utils/geo'

const oneDegreeOfLatitude: Coordinates = {
  latitude: STORE_COORDINATES.latitude + 0.01,
  longitude: STORE_COORDINATES.longitude,
}

describe('haversineDistanceKm', () => {
  it('deve retornar zero para o mesmo ponto', () => {
    expect(haversineDistanceKm(STORE_COORDINATES, STORE_COORDINATES)).toBe(0)
  })

  it('deve medir aproximadamente 1,11 km para 0,01° de latitude', () => {
    expect(
      haversineDistanceKm(STORE_COORDINATES, oneDegreeOfLatitude),
    ).toBeCloseTo(1.11, 1)
  })
})

describe('roadDistanceKm', () => {
  it('deve aplicar o fator viário sobre a distância em linha reta', () => {
    const straight = haversineDistanceKm(STORE_COORDINATES, oneDegreeOfLatitude)
    const road = roadDistanceKm(STORE_COORDINATES, oneDegreeOfLatitude)

    expect(road).toBeCloseTo(straight * DELIVERY_ROAD_FACTOR, 5)
  })
})

describe('formatDistance', () => {
  it('deve exibir metros abaixo de 1 km', () => {
    expect(formatDistance(0)).toBe('0 m')
    expect(formatDistance(0.35)).toBe('350 m')
  })

  it('deve exibir quilômetros com uma casa decimal e vírgula', () => {
    expect(formatDistance(2.44)).toBe('2,4 km')
    expect(formatDistance(12)).toBe('12,0 km')
  })
})
