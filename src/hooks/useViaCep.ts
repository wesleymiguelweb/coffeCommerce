import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAddressByCep } from '../services/viaCep'
import type { ViaCepResponse } from '../services/viaCep'
import { normalizeCep } from '../utils/cep'

const CEP_NOT_FOUND_MESSAGE =
  'CEP não encontrado. Confira o número ou preencha o endereço manualmente.'
const CEP_REQUEST_ERROR_MESSAGE =
  'Não foi possível consultar o CEP agora. Preencha o endereço manualmente.'

export interface UseViaCepResult {
  isLoading: boolean
  error: string | null
  lookup: (cep: string) => Promise<ViaCepResponse | null>
  reset: () => void
}

export function useViaCep(): UseViaCepResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequest = useRef<AbortController | null>(null)

  const reset = useCallback(() => {
    activeRequest.current?.abort()
    activeRequest.current = null
    setIsLoading(false)
    setError(null)
  }, [])

  const lookup = useCallback(async (cep: string): Promise<ViaCepResponse | null> => {
    const digits = normalizeCep(cep)
    if (digits.length !== 8) return null

    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller

    setIsLoading(true)
    setError(null)

    const result = await fetchAddressByCep(digits, controller.signal)

    if (controller.signal.aborted) return null

    setIsLoading(false)

    if (result.status === 'success') {
      return result.address
    }

    setError(
      result.status === 'not-found'
        ? CEP_NOT_FOUND_MESSAGE
        : CEP_REQUEST_ERROR_MESSAGE,
    )

    return null
  }, [])

  useEffect(() => {
    return () => {
      activeRequest.current?.abort()
    }
  }, [])

  return { isLoading, error, lookup, reset }
}
