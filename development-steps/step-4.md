# Step 4: Update `ApplyChangesModal` to Use the New Next.js Route

## Overview
- Switched from calling `applyJsonChanges` in the browser to `axios.post('/api/apply-json-changes')`.
- Commented out or removed references to the old browser-based approach for fallback.
- Handled success/failure using the Next.js route response to show relevant toasts.
- Added a big TODO about rewriting or removing the existing BDD test approach (`apply-json-changes-tests.ts`).

## Implementation Details
1. **Partial Update** `ApplyChangesModal.tsx`:
   - Commented out imports from `apply-json-changes.ts` and `apply-json-changes-tests.ts`.
   - Replaced `handleApply` logic to post JSON changes to `/api/apply-json-changes`.
   - Inserted a TODO regarding offline usage fallback.
   - Inserted a big TODO in `handleRunTests` method about converting or removing the BDD tests.

## Next Steps
- Confirm that the server-side route (app/api/apply-json-changes/route.ts) handles all validations and path sanitization.
- Potentially remove `applyJsonChanges` from the codebase in future steps if offline usage is no longer required.
- Migrate or unify the old BDD test logic to the Node-based approach so everything is tested consistently server-side.