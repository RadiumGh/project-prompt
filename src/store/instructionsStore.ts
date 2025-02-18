import { create } from 'zustand'

interface InstructionsState {
  instructions: string
  setInstructions: (value: string) => void
  setStateFromConfig: (config: any) => void
  getFinalPrompt: (
    loadedFiles: { path: string; content: string }[],
    activeCustoms: { content: string }[],
    includeTreeInPrompt: boolean,
  ) => string
  getFinalPromptTokens: (
    loadedFiles: { path: string; content: string }[],
    activeCustoms: { content: string }[],
    includeTreeInPrompt: boolean,
  ) => number
}

function buildAsciiTree(paths: string[]): string {
  const root: Record<string, any> = {}
  for (const p of paths) {
    const segments = p.split('/')
    let current = root
    for (const seg of segments) {
      if (!current[seg]) {
        current[seg] = {}
      }
      current = current[seg]
    }
  }

  function printTree(
    obj: Record<string, any>,
    prefix: string,
    _isLast: boolean,
  ): string {
    const entries = Object.keys(obj).sort()
    let output = ''
    entries.forEach((key, index) => {
      const child = obj[key]
      const childIsLast = index === entries.length - 1
      const lineSymbol = childIsLast ? '└── ' : '├── '
      output += prefix + lineSymbol + key + '\n'
      const subPrefix = prefix + (childIsLast ? '   ' : '│  ')
      if (Object.keys(child).length > 0) {
        output += printTree(child, subPrefix, childIsLast)
      }
    })
    return output
  }

  return printTree(root, '', true).trim()
}

export const useInstructionsStore = create<InstructionsState>((set, get) => ({
  instructions: '',

  setInstructions(value) {
    set({ instructions: value })
  },

  setStateFromConfig(config) {
    if (typeof config.instructions === 'string') {
      set({ instructions: config.instructions })
    }
  },

  getFinalPrompt(loadedFiles, activeCustoms, includeTreeInPrompt) {
    let final = ''
    if (activeCustoms.length > 0) {
      final +=
        '### Instructions for Assistant:\n"""' +
        activeCustoms.map(ci => ci.content).join('\n\n') +
        '"""\n'
    }
    final += '\n' + get().instructions + '\n\n'
    if (loadedFiles.length > 0) {
      final +=
        '\n### Context:\n"""' +
        loadedFiles
          .map(file => `---\nFile: ${file.path}\n${file.content}`)
          .join('\n') +
        '"""\n'
    }
    if (includeTreeInPrompt && loadedFiles.length > 0) {
      const paths = loadedFiles.map(f => f.path)
      const ascii = buildAsciiTree(paths)
      if (ascii.trim()) {
        final += '\n\nFILES TREE:\n' + ascii
      }
    }
    return final
  },

  getFinalPromptTokens(loadedFiles, activeCustoms, includeTreeInPrompt) {
    const text = get().getFinalPrompt(
      loadedFiles,
      activeCustoms,
      includeTreeInPrompt,
    )
    const { approximateTokens } = require('../utils/tokenHelpers')
    return approximateTokens(text)
  },
}))
