import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('[callback] Error en URL:', error, errorDescription)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription ?? error)}`)
  }

  if (!code) {
    console.error('[callback] No code provided')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  try {
    const supabase = await createClient()
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError || !data.session) {
      console.error('[callback] Exchange error:', exchangeError)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError?.message ?? 'no_session')}`)
    }

    // Comprobar si hay un invite pendiente en user_metadata
    const user = data.session.user
    const pendingToken = user.user_metadata?.pending_invite_token

    if (pendingToken) {
      // Aceptar invite: crea perfil + añade como miembro
      await supabase.rpc('accept_artist_invite', {
        p_token: pendingToken,
        p_display_name: user.user_metadata?.display_name || '',
      })

      // Limpiar metadata
      await supabase.auth.updateUser({
        data: { pending_invite_token: null },
      })

      return NextResponse.redirect(`${origin}/home`)
    }

    // Sin invite pendiente: flujo normal
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    if (profile?.onboarding_completed) {
      return NextResponse.redirect(`${origin}/home`)
    }

    return NextResponse.redirect(`${origin}/setup`)
  } catch (err) {
    console.error('[callback] Unexpected error:', err)
    return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
  }
}
