import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { listDirectory } from '../../../server-utils/listDirectory'
import { watchProjectDir } from '../../../server-utils/fileWatcher'

// Store active SSE clients
const clients = new Set<ReadableStreamDefaultController>()

export async function GET(req: NextRequest) {
  try {
    const baseDir = process.env.PJP_PROJECT_ROOT || process.cwd()
    const isSSE = req.headers.get('accept') === 'text/event-stream'

    // List the directory as before
    const tree = listDirectory(baseDir)
    // Dynamically derive the root directory name (the project name)
    const rootDirName = path.basename(baseDir)

    if (isSSE) {
      const stream = new ReadableStream({
        start(controller) {
          clients.add(controller)

          // Send initial tree along with the rootDirName
          controller.enqueue(
            `data: ${JSON.stringify({ tree, rootDirName })}\n\n`,
          )

          // Set up file watcher if not already watching
          watchProjectDir(baseDir, () => {
            const updatedTree = listDirectory(baseDir)
            try {
              controller.enqueue(
                `data: ${JSON.stringify({ tree: updatedTree, rootDirName })}\n\n`,
              )
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

    // Regular GET request - return tree + rootDirName in JSON
    return NextResponse.json({ tree, rootDirName })
  } catch (error: any) {
    console.error('Error listing directory:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
