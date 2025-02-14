# Project Prompt (Next.js Edition)

A Next.js 13+ application that lets users select local files, generate combined prompts, and apply JSON-based code changes via a server-side API. This project offers a robust front-end with MUI and Zustand, plus Node-based file operations inside Next’s app routes.

## Features
- **Directory Selection**: Client-side or Node-based approach to handle local files. For code modifications, we recommend the server-side route `/api/apply-json-changes`.
- **File Loading**: Filter files using ignore patterns, select specific files or folders, and load them into the prompt context.
- **Custom Instructions**: Create, edit, reorder, or toggle additional instruction blocks. These are appended to your main instructions in the final prompt.
- **Prompt Generation**: Combine instructions, custom instructions, and file contents, optionally including an ASCII tree of your file structure.
- **JSON-based File Changes**: Submit JSON to `/api/apply-json-changes` to create, update, or delete files. Node handles real filesystem edits.
- **Global Snackbars**: Quick success/error messages using MUI’s `Alert` + `Snackbar`.
- **Light/Dark Themes**: Toggle between them via our Zustand `themeStore` and MUI’s `ThemeProviderClient`.

## Getting Started
1. **Clone** the repository and run `npm install` to install dependencies.
2. **Development**: `npm run dev` (launches Next.js on port 3000 by default).
3. **Build**: `npm run build` (uses Next’s build process). Then `npm run start` for production mode.
4. Visit [http://localhost:3000](http://localhost:3000). Check `/prompt` for the main UI.

## Usage Flow
1. **Open the Prompt Page** (`/prompt`) to see a two-pane interface for directory selection and instructions. Optionally load files, add custom instructions, and generate a final prompt.
2. **Copy or View** the entire prompt using the “Full Prompt” button. Tokens are estimated using `js-tiktoken`.
3. **Apply Code Changes** by opening the “Apply Changes” modal and pasting your JSON change structure. The app will POST to `/api/apply-json-changes`, which updates files server-side.

## Testing
- **Unit Tests**: Run `npm run test` (assuming you’ve configured Jest). The file `server-utils/applyJsonChangesNode.test.ts` covers create/delete/partial updates, etc.
- **Integration**: For deeper verification, call the `/api/apply-json-changes` route from a test script to confirm real filesystem changes. Possibly add end-to-end tests using Cypress or Playwright if needed.

## Advanced Usage & Security
- **Environment Variables**:  Use a `.env.local` (or `.env` in production) to store environment variables. In Next, server-side envs can be accessed in `/api/` routes, while client-side requires a `NEXT_PUBLIC_` prefix.
- **Security**:
1. **Path Sanitization**: The app enforces a check that prohibits changes outside the base directory. If `path.relative` from `baseDir` starts with `..`, an error is thrown.
2. **Authentication**: If deployed publicly, protect the `/api/apply-json-changes` endpoint with your auth strategy (JWT, NextAuth, etc.).
3. **Injection**: We parse JSON via `JSON.parse()` and do not execute scripts from user-supplied content. Use caution if large updates are allowed.
- **Scaling & Performance**:
1. Next.js can scale easily on platforms like Vercel or Docker-based hosting.
2. For high-traffic scenarios or huge JSON updates, you might add concurrency controls, a job queue, or chunk-based updates.
3. Consider SSR or incremental static regeneration if you need real-time data from large directories, though current usage is fairly direct.
## Key Directories & Files
- **app/**: Next.js 13+ structure (layout, pages, and API routes).
- **server-utils/**: Node-based logic for applying JSON changes (`applyJsonChangesNode.ts`).
- **src/components/**: UI components (modals, inputs, instructions).
- **src/store/**: Zustand stores (files, instructions, theming, merges).
- **development-steps/**: Step-by-step documentation of the migration process.

## JSON-based Code Changes
We replaced legacy client-side FS logic with a server route (`POST /api/apply-json-changes`). Each change object has a `type` (`create`, `delete`, `complete_update`, `partial_update`, `rename_move`) plus the necessary file path or content. See `server-utils/applyJsonChangesNode.ts` for the complete implementation, including path sanitization checks.

## Contributing
1. **Fork** this repo, create a feature branch, add improvements or bug fixes.
2. **Pull Request** into our main branch with a clear description of your changes.
3. Include tests, consistent code style, and thorough documentation when possible.

## License
Distributed under the AGPL v3 license. Please keep this notice intact if you distribute any modified versions.