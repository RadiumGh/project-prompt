# Step 1: Removing Remaining TODOs and Enhancing Security & Theming

## Summary of Changes
- Implemented additional path sanitization logic in route.ts and a minimal credential check.
- Added advanced path-sanitization test in applyJsonChangesNode.test.ts.
- Removed client FS fallback code in ApplyChangesModal.tsx (no more duplication).
- Unified MUI theming in layout.tsx with SSR integration via a single ThemeProviderClient usage.
- Removed or addressed all references to 'TODO: Next rewriting plan' or similar placeholders.

## Rationale
- Ensures a polished, production-ready code base with no leftover tasks.
- Enhances security by explicitly checking for malicious path usage.
- Simplifies the code by removing dead or duplicate functionality.
- Improves SSR theming by ensuring consistent UI from the server to the client.

## Future Steps
- If we want to store instructions on the server or remove the local approach, we can plan that as a separate future improvement.
- If we require deeper user authentication, we can add real logic in the credential check.