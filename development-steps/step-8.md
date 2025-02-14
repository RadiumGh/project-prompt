# Step 8: Consolidate Old Tests Into Node-based BDD Suite

## Overview
- We are converting the old browser-based BDD tests from `src/utils/apply-json-changes-tests.ts` into a Node-based Jest test suite that directly tests `applyJsonChangesNode.ts` with real filesystem operations.
- We keep the same Gherkin-like scenario coverage, plus any relevant smaller unit tests from the existing `applyJsonChangesNode.test.ts` file, unifying them into a single test file.
- Finally, we delete the old browser-based test file entirely.

## Key Points
1. **Real FS Testing**: We create and remove files in a temporary directory so each scenario is tested realistically.
2. **Removal of Old File**: `apply-json-changes-tests.ts` is fully removed now that we have feature parity.
3. **TODO**: Future E2E or integration tests can be added to confirm the entire Next route pipeline. Also, we will eventually add negative tests for path sanitization checks.

## Implementation Details
- Replaced mocking with `fs` calls in a `beforeAll` & `afterAll` block that sets up a temporary directory for tests.
- Ported all BDD scenarios (create, delete, partial_update, rename/move, invalid JSON structure) to the new Node-based suite.
- Preserved minimal coverage tests (like missing changes array) in the same suite.
- Marked a TODO for path sanitization logic tests in the future.

## Implementation Log
- Step 8 completed: new integrated Node test suite, old browser-based test removed.