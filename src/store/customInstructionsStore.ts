import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
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
  reorderCustomInstructions: (oldIndex: number, newIndex: number) => void
  setAllCustomInstructions: (items: CustomInstruction[]) => void
  setStateFromConfig: (config: any) => void
}

export const useCustomInstructionsStore = create<CustomInstructionsState>(
  (set, get) => ({
    customInstructions: [],

    addCustomInstruction: (name, content) => {
      const newCI: CustomInstruction = {
        id: uuidv4(),
        name,
        content,
        isActive: true,
      }
      set({ customInstructions: [...get().customInstructions, newCI] })
    },

    updateCustomInstruction: (id, name, content) => {
      const updated = get().customInstructions.map(ci =>
        ci.id === id ? { ...ci, name, content } : ci,
      )
      set({ customInstructions: updated })
    },

    removeCustomInstruction: id => {
      const updated = get().customInstructions.filter(ci => ci.id !== id)
      set({ customInstructions: updated })
    },

    toggleCustomInstruction: id => {
      const updated = get().customInstructions.map(ci =>
        ci.id === id ? { ...ci, isActive: !ci.isActive } : ci,
      )
      set({ customInstructions: updated })
    },

    reorderCustomInstructions: (oldIndex, newIndex) => {
      const current = get().customInstructions
      if (oldIndex === newIndex) return
      const reordered = arrayMove(current, oldIndex, newIndex)
      set({ customInstructions: reordered })
    },

    setAllCustomInstructions: items => {
      set({ customInstructions: items })
    },

    setStateFromConfig(config) {
      if (Array.isArray(config.customInstructions)) {
        set({ customInstructions: config.customInstructions })
      }
    },
  }),
)
