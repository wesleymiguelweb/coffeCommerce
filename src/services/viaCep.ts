import { normalizeCep } from '../utils/cep'

const VIACEP_BASE_URL = 'https://viacep.com.br/ws'

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento?: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean | string
}

export type ViaCepLookupResult =
  | { status: 'success'; address: ViaCepResponse }
  | { status: 'not-found' }
  | { status: 'invalid' }
  | { status: 'error' }

/**
 * Looks up a Brazilian postal code on ViaCEP. The caller receives a
 * discriminated result instead of an exception, so UI states stay explicit.
 */
export async function fetchAddressByCep(
  cep: string,
  signal?: AbortSignal,
): Promise<ViaCepLookupResult> {
  const digits = normalizeCep(cep)
  if (digits.length !== 8) return { status: 'invalid' }

  try {
    const response = await fetch(`${VIACEP_BASE_URL}/${digits}/json/`, { signal })

    if (!response.ok) return { status: 'error' }

    const data: ViaCepResponse = await response.json()

    if (data.erro) return { status: 'not-found' }

    return { status: 'success', address: data }
  } catch {
    return { status: 'error' }
  }
}
