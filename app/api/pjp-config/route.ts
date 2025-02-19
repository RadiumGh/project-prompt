import { NextRequest, NextResponse } from 'next/server'
import { loadPjpConfig, savePjpConfig } from '@/server-utils/pjpConfig'

export async function GET() {
  try {
    const config = await loadPjpConfig()

    return NextResponse.json(config)
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    await savePjpConfig(body)
    return NextResponse.json({ status: 'ok' })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
