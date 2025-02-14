# Step 1: Detailed Plan for Next.js Rewrite & Server-Side JSON Changes

## Overview
- **Preserve all existing code**: We will not remove or overwrite old Vite/React files. Instead, we’ll add TODO blocks explaining how each file/component will be re-implemented or adapted in Next.js.
- **Next.js Migration**: We aim to reorganize the project structure into a Next.js layout, utilize server-side capabilities (Node.js) for reading & modifying files, and keep existing UI code as references.
- **Server-Side applyJsonChanges**: We will create a new Node.js route/handler (in Next.js app/api/apply-json-changes/route.ts) to handle file modifications (create/update/delete) by reading JSON requests and using the Node `fs` module or similarly robust approach.
- **No Deletions**: All old code remains. We add step-by-step transformations (or re-creations) within Next’s structure. We keep references for each component, so we do not disrupt existing logic until the final migration is tested.

## Implementation Considerations
1. **Next.js Files**:
   - We will create a Next.js app directory (e.g. `app/`) with layout and page files. Possibly sub-routes for sub-pages or new server routes for custom instructions, merges, etc.
   - We'll replicate critical logic from existing `App.tsx` into Next’s `app/layout.tsx` or `app/page.tsx`, reusing MUI if desired.

2. **Server-Side File Access**:
   - The new route (app/api/apply-json-changes/route.ts) will parse JSON changes, then perform file operations with Node’s `fs` or `fs/promises` API. This avoids purely client-side FS Access constraints.
   - We’ll handle error states, partial updates, and logging. We can keep partial or complete updates to handle large files or small changes, referencing best security practices in Next.

3. **Zustand + MUI**:
   - We can continue using Zustand stores for client state, or mix in Next’s server actions where appropriate. We'll keep MUI for theming, modals, etc., but adapt them to Next’s usage patterns.

4. **Incremental Rewrites**:
   - Each component (e.g., DirectoryTree, InstructionsField) may become a Next client component or a server route. We only add small TODO blocks in existing code to outline next steps. We do not break current code flow.
   - We can finalize the rewrite in a future step, systematically moving or refactoring code into Next’s structure.

## Next Steps
- **Step 2**: Implement the new `app/api/apply-json-changes/route.ts` with Node filesystem operations. Provide scaffolding for a front-end call to this route from the existing UI or from a new Next-based form.
- **Step 3**: Start migrating major UI components (e.g., the directory tree, instructions modals) to Next’s recommended approach, ensuring any server features are tested thoroughly.
- **Step 4**: Update build scripts, remove Vite references, finalize documentation to reflect the Next.js architecture.

This file (step-1.md) can be expanded with more details if needed. We will keep referencing it as we go.

## Implementation Log
### SubTask 1: Basic Next.js Setup
- Created a new `app/` directory for Next.js 13.
- Added `layout.tsx` and `page.tsx` with minimal placeholders.
- Updated `package.json` to include Next.js, TypeScript, and dev scripts to run Next in parallel.
- Ensured existing Vite-based code remains untouched.