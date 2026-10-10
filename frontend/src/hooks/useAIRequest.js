import { useState, useCallback } from 'react'

/**
 * Generic hook that wraps an async API call.
 * Returns { data, loading, error, execute, reset }.
 */
export function useAIRequest(apiFn) {
  const [state, setState] = useState({ data: null, loading: false, error: null })

  const execute = useCallback(async (payload) => {
    setState({ data: null, loading: true, error: null })
    try {
      const result = await apiFn(payload)
      setState({ data: result, loading: false, error: null })
      return result
    } catch (err) {
      const msg = err?.response?.data?.error
        || err?.message
        || 'An unexpected error occurred.'
      const code = err?.response?.data?.code || 'UNKNOWN'
      setState({ data: null, loading: false, error: { message: msg, code } })
    }
  }, [apiFn])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
