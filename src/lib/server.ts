import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function parseCookieHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined
  const parts = cookieHeader.split(';').map((p) => p.trim())
  const match = parts.find((p) => p.startsWith(name + '='))
  if (!match) return undefined
  return decodeURIComponent(match.split('=')[1] || '')
}

// Accept optional Request to read cookies from req.headers when available
export async function createSupabaseServerClient(req?: Request) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // For API routes, get cookies from request headers
          if (req && req.headers && typeof req.headers.get === 'function') {
            const cookieHeader = req.headers.get('cookie')
            if (cookieHeader) {
              return parseCookieHeader(cookieHeader, name)
            }
          }
          return undefined
        },
        set(name: string, value: string, options?: any) {
          // For API routes, we don't set cookies here
          // Cookies are set by the response
        },
        remove(name: string, options?: any) {
          // For API routes, we don't remove cookies here
          // Cookies are removed by the response
        },
      },
    }
  )
}
