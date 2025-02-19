import { NextRequest, NextResponse } from 'next/server'
import { listDirectory } from '@/server-utils/listDirectory'
import { watchProjectDir } from '@/server-utils/fileWatcher'

// Store active SSE clients
const clients = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  try {
    const baseDir = process.cwd()
    const isSSE = req.headers.get('accept') === 'text/event-stream'

    if (isSSE) {
      const stream = new ReadableStream({
        start(controller) {
          clients.add(controller)

          // Send initial tree
          const tree = listDirectory(baseDir)
          controller.enqueue(`data: ${JSON.stringify({ tree })}\n\n`)

          // Set up file watcher if not already watching
          watchProjectDir(baseDir, () => {
            const updatedTree = listDirectory(baseDir)
            try {
              controller.enqueue(`data: ${JSON.stringify({ tree: updatedTree })}\n\n`)
            } catch (err) {
              // stream closed, ignore error
            }
          })
        },
        cancel(controller) {
          clients.delete(controller)
        },
      })

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Regular GET request
    const tree = listDirectory(baseDir)
    return NextResponse.json({ tree })
  } catch (error: any) {
    console.error('Error listing directory:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
