# Project Prompt (Next.js Edition)

A Next.js 13+ application that lets users select local files, generate combined prompts, and apply JSON-based code changes via a server-side API. This project offers a robust front-end with MUI and Zustand, plus Node-based file operations inside Next’s app routes.

## Features
- **Directory Selection**: Client-side or Node-based approach to handle local files. Currently, the recommended approach is the server-side route `/api/apply-json-changes` for code modifications.
- **File Loading**: Filter files using ignore patterns, select specific files or folders, and load them into the prompt context.
- **Custom Instructions**: Create, edit, reorder, or toggle additional instruction blocks. These are appended to your main instructions in the final prompt.
- **Prompt Generation**: Combine instructions, custom instructions, and file contents, optionally including an ASCII tree of your file structure.
- **JSON-based File Changes**: Submit JSON to `/api/apply-json-changes` to create, update, or delete files in your selected directory or on the server’s filesystem (for real deployments).
- **Global Snackbars**: Quick success/error messages using MUI’s Alert + Snackbar.
- **Light/Dark Themes**: Toggle between them via our Zustand `themeStore` and MUI’s `ThemeProviderClient`.

## Getting Started
1. **Clone** the repository and run `npm install` to install dependencies.
2. **Development**: `npm run dev` (launches Next.js on default port 3000).
3. **Build**: `npm run build` (uses Next’s build process). Then `npm run start` to run in production mode.
4. Open your browser at [http://localhost:3000](http://localhost:3000).

## Usage Flow
1. If you need local file operations, open the `Prompt` page (`/prompt`) to see a two-pane interface. The left pane is for directory selection, ignoring certain patterns, and loading files. The right pane is for instructions, custom instructions, and viewing loaded files.
2. Combine your instructions with the loaded files into a final prompt. Copy or view the entire prompt with the “Full Prompt” button.
3. When you want to apply code changes, open the “Apply Changes” modal. You can paste a JSON structure describing create/delete/update/rename operations. This is posted to the Next API route `/api/apply-json-changes`, where Node handles real filesystem edits.

## Key Directories & Files
- **app/**: Next.js 13+ structure, including `page.tsx`, `layout.tsx`, API routes, and a `prompt/` sub-page for the main UI.
- **server-utils/**: Node-based logic for applying JSON changes to the file system (`applyJsonChangesNode.ts`).
- **src/components/**: The majority of UI components (modals, input fields, etc.).
- **src/store/**: Zustand stores controlling app state (files, instructions, theming, etc.).
- **development-steps/**: Progressive documentation of how each subtask was implemented and finalized.

## JSON-based Code Changes
We replaced the legacy Vite-based approach with a server route (`POST /api/apply-json-changes`) that accepts a JSON body. Each change has a `type` (`create`, `delete`, `complete_update`, `partial_update`, `rename_move`) along with the necessary paths or content. See `server-utils/applyJsonChangesNode.ts` for full details.

## Contributing
1. **Fork** this repo, create a feature branch, and add your improvements or bug fixes.
2. **Pull Request** into our main branch. Provide a clear description of your changes.
3. We encourage tests, consistent code style, and thorough documentation for new features.

## License
Distributed under AGPL v3. Feel free to use, modify, and distribute, provided you keep this license notice intact.