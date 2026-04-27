import type { ApiResponse } from '@/types/api'

export async function fetchApi<T>(url: string, defaultError: string): Promise<T> {
    const res = await fetch(url)
    const json = (await res.json()) as ApiResponse<T>
    if (!json.ok) throw new Error(json.error?.message ?? defaultError)
    return json.data
}
