// src/app/api/client-logs/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const ts = new Date().toISOString()
    const level = body?.level ?? 'log'
    const scope = body?.scope ?? 'client'
    const message = body?.message ?? ''
    const data = body?.data ?? null

    console.log(
      `[CLIENT ${ts}] [${level.toUpperCase()}] [${scope}] ${message}`,
      data ?? ''
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[CLIENT LOG ROUTE ERROR]', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}