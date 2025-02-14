
// <ai_context>
// TODO: Next rewriting plan: We may keep Zustand store for client side or switch to Next server actions for storing instructions.
//  Manages the list of custom instructions, each with its own ID, name, content, and isActive.
// </ai_context>

import { v4 as uuidv4 } from 'uuid'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// We can import a small array-move utility from @dnd-kit/sortable:
import { arrayMove } from '@dnd-kit/sortable'

export interface CustomInstruction {
  id: string
  name: string
  content: string
  isActive: boolean
}

interface CustomInstructionsState {
  customInstructions: CustomInstruction[]
  addCustomInstruction: (name: string, content: string) => void
  updateCustomInstruction: (id: string, name: string, content: string) => void
  removeCustomInstruction: (id: string) => void
  toggleCustomInstruction: (id: string) => void

  // Reorder instructions by drag-and-drop
  reorderCustomInstructions: (oldIndex: number, newIndex: number) => void
}

export const useCustomInstructionsStore = create<CustomInstructionsState>()(
  persist(
    (set, get) => ({
      customInstructions: [],

      addCustomInstruction: (name, content) => {
        const newCI = {
          id: uuidv4(),
          name,
          content,
          isActive: true
        }
        const updated = [...get().customInstructions, newCI]
        set({ customInstructions: updated })
      },

      updateCustomInstruction: (id, name, content) => {
        const updated = get().customInstructions.map(ci =>
          ci.id === id ? { ...ci, name, content } : ci
        )
        set({ customInstructions: updated })
      },

      removeCustomInstruction: (id) => {
        const updated = get().customInstructions.filter(ci => ci.id !== id)
        set({ customInstructions: updated })
      },

      toggleCustomInstruction: (id) => {
        const updated = get().customInstructions.map(ci =>
          ci.id === id ? { ...ci, isActive: !ci.isActive } : ci
        )
        set({ customInstructions: updated })
      },

      reorderCustomInstructions: (oldIndex, newIndex) => {
        const current = get().customInstructions
        if (oldIndex === newIndex) return
        const reordered = arrayMove(current, oldIndex, newIndex)
        set({ customInstructions: reordered })
      }
    }),
    {
      name: 'custom-instructions-store'
    }
  )
)
