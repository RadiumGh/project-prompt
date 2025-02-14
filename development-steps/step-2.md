# Step 2: Add Next.js API Route for apply-json-changes (Server-Side)

## Overview
- We created a new `POST` route at `app/api/apply-json-changes/route.ts`.
- This route parses an incoming JSON body following the `ChangesJson` structure and calls a placeholder server utility for applying changes using Node fs/promises in the future.
- Minimal error handling (400/500) with basic logs. Future expansions will handle concurrency, advanced logging, path sanitization, etc.

## Implementation Details
1. **New File**: `server-utils/applyJsonChangesNode.ts` with a big TODO referencing `apply-json-changes.ts` from the old browser-based logic.
2. **Route**: In the `POST` handler, we do the following:
   - Parse body as JSON. If parse fails, return 400.
   - Log the received changes (for debug).
   - [Placeholder] Call `applyJsonChangesNode(...)` — which is empty right now except for logging.
   - Return `{ status: 'ok' }` on success.
   - Catch any fs/other errors → return 500 with error message.
3. **Security**: Insert a TODO for path sanitization and optional auth token checks.
4. **No UI changes**. The `ApplyChangesModal` or other calls can be adapted later to do a fetch/cURL to the new route.

## Next Steps
1. Subtask 3 or beyond might fill out `applyJsonChangesNode.ts` fully, adding robust path checks, concurrency handling, and using actual fs operations.
2. Possibly unify old `apply-json-changes.ts` logic and Node-based approach so the code runs consistently server-side.

## Implementation Log
- Created new `server-utils/applyJsonChangesNode.ts` (placeholder).
- Updated `route.ts` under `app/api/apply-json-changes/` with minimal POST logic and error handling.
- This step is marked complete!