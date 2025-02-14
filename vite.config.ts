// <ai_context>
// TODO: Next rewriting plan: We'll remove or ignore Vite eventually, but preserve for reference until Next fully replaces it.
//  Vite configuration file for React project with plugin-react.
// </ai_context>

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
