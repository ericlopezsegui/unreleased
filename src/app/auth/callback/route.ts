import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  try {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError?.message ?? 'no_session')}`)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', data.session.user.id)
      .single()

    if (profile?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/home`)
    }

    return NextResponse.redirect(`${origin}/setup`)
  } catch {
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
  }
}
