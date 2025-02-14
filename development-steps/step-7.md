# Step 7: Refine or Replace Old Browser-Based FS Logic & Document Next Steps

## Overview
- We performed a code sweep to add prominent `TODO` comments around all references to `window.showDirectoryPicker` and browser-based FS usage.
- We also annotated `apply-json-changes-tests.ts` with a clear note about migrating or removing the browser-based BDD testing approach in the near future.
- This subtask does **not** finalize the removal of the old code; we only mark it for future unification or deprecation once the Node-based approach is fully tested and in use.

## Details
1. **`fileStore.ts`**: Added `TODO` lines around `window.showDirectoryPicker` usage, clarifying that it is transitional.
2. **`apply-json-changes-tests.ts`**: Inserted a big note at the top, alerting us that we plan to unify or remove these tests once server-based testing is stable.
3. **`ApplyChangesModal.tsx`**: Strengthened the existing fallback `TODO` note, clarifying that offline usage might eventually rely on Node-based solutions as well.

## Next Steps
- In a future subtask, we may fully remove or hide these old flows behind a feature flag, or unify them with the Node-based approach if a local filesystem fallback is still desired.
- Additional QA steps to ensure we do not leave broken references or half-removed code paths.

## Implementation Log
- Marked old FS references with `TODO: unify or remove` style comments for clarity.
- No functional changes, only in-code documentation improvements.