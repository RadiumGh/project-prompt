## **Subtask 1**: Remove Browser FS References & Consolidate Node-based Tree Loading

### 1. Questions or Clarifications
1. Should we completely remove all mentions of `window.showDirectoryPicker` and the associated functionality (like `fileStore.openDirectory`, `refreshDirectory`)?
2. Where do we want the user to specify the **local path** on the server side (if any)? Or do we prefer a simplified approach that sets a default or environment-based path for demonstration?
3. Are we retaining any offline usage for file operations, or is everything strictly handled by the Node route for this final version?

### 2. Relevant Experts
- **Modular & Maintainable Architecture Expert**  
- **Data Structures & Store Architect**  
- **Security Specialist**  
- **Code Quality & Linting Standard Enforcer**  
- **Project Manager / Agile Coach**

### 3. Dialogue

```
## Subtask1
- Remove code referencing window.showDirectoryPicker and the localFileSystem approach in fileStore.ts.
- Decide how the Node-based approach obtains the project directory path (e.g., a default, an environment variable, or a user-provided input).
- Clean up store actions that rely on the browser FS. Mark them as removed or replaced with Node-based API calls.
- Ensure we do not break other parts of the code that rely on loadedFiles. We’ll fetch or load them from the Node side or remove the concept if not needed.
- Remove any “TODO” or fallback references (like "Reopen last folder" logic). 
- Update or remove the UI elements (buttons, modals) used specifically for browser-based directory selection, so they either call the Node route or are removed if no longer relevant.
- expert review: 
  - (Data Structures & Store Architect): “We must keep only the ‘loadedFiles’ concept if we have an API that fetches them. Let’s unify everything to a simpler approach.”
  - (Security Specialist): “Ensure no leftover references to user-chosen local paths that might bypass security. We’ll rely on the Node server’s controlled directory path.”
  - (Code Quality & Linting Standard Enforcer): “Keep code style consistent, remove commented-out references, and ensure lint passes after the removal.”
  - (Project Manager / Agile Coach): “This subtask must be small enough to avoid merges with the next step. Once done, we can proceed.”
```

### 4. Implementation Guidelines
- **Security**: Validate how the Node-based logic obtains file trees (likely from a safe path). Remove or disable any direct client-based folder picking.
- **Performance**: If large directory trees are loaded, consider lazy-loading or incremental expansions on the server. For now, keep it simple unless performance is critical.
- **Testing**: Update or remove existing tests that checked the browser FS logic. Possibly create a new test for Node-based tree retrieval if not already covered.
- **Documentation**: Wipe references to browser-based FS usage. Document that file operations occur solely on the Node side.

---

## **Subtask 2**: Merge `app/prompt/page.tsx` into Single Root Route at `/`

### 1. Questions or Clarifications
1. Do we need to keep the “prompt” page’s unique styling or route? Or do we unify it entirely into `app/page.tsx` with minimal layout changes?
2. Should any leftover references to `/prompt` or `PromptPage` be preserved for legacy linking, or is it safe to remove them entirely?

### 2. Relevant Experts
- **Product Designer Expert**  
- **React Ecosystem Expert**  
- **Professional UI & UX Designer**  
- **Project Manager / Agile Coach**  

### 3. Dialogue

```
## Subtask2
- Move all functionality and UI from `app/prompt/page.tsx` into `app/page.tsx`, preserving the existing top-level layout (ThemeProvider, SSR, etc.).
- Remove `app/prompt` folder if no longer needed. Update or re-route any references from `"/prompt"` to the root `"/"`.
- If there are style differences or collisions, unify them carefully. 
- The final structure: user lands on `/` and sees the entire app’s main interface (instructions, file loading, apply changes, etc.).
- Make sure any import statements referencing `prompt/page.tsx` or its route are updated or removed.
- expert review:
  - (Professional UI & UX Designer): “We must ensure that merging the prompt page’s design into the root route does not degrade user experience or layout clarity.”
  - (Product Designer Expert): “No leftover references to the old route. Provide a single clean entry point.”
  - (Project Manager / Agile Coach): “This subtask is purely UI route merging. Let’s keep code changes straightforward and minimal to reduce risk.”
```

### 4. Implementation Guidelines
- **Accessibility**: Confirm headings, semantic structure remain consistent when merging pages.
- **Testing**: Adjust any route-based tests or snapshots to reference `/` rather than `/prompt`.
- **Documentation**: Update README to clarify the new single-route usage. Remove mention of `/prompt`.

---

## **Subtask 3**: Remove Remaining TODOs & Placeholders, Final Code Sweep

### 1. Questions or Clarifications
1. Are there any partial stubs or “Coming Soon…” placeholders that must remain? Or should they all be removed in favor of a final, production-ready message or feature removal?
2. Which leftover references do we keep if they’re used for demonstration or training?

### 2. Relevant Experts
- **Code Quality & Linting Standard Enforcer**  
- **Error Handling Expert**  
- **Bug Hunter & Code Review Expert**  
- **Testing & Quality Assurance Specialist**

### 3. Dialogue

```
## Subtask3
- Search for all "TODO" / "Subtask7" / "Next rewriting plan" references. Either implement them if needed or remove them entirely.
- Ensure no incomplete stubs remain. For instance, “Coming Soon…” modals—decide if we keep them as final placeholders or remove them.
- Double-check all code for leftover logs or commented-out code blocks.
- Ensure error handling messages are consistent and user-friendly. 
- expert review:
  - (Error Handling Expert): “Check we have consistent error boundaries and logs. No dev placeholders for stack traces in production code.”
  - (Bug Hunter & Code Review Expert): “We must confirm no references or code blocks that break best practices. Also watch for dead imports.”
  - (Testing & QA Specialist): “Ensure that removing placeholders doesn’t break test coverage. Update test snapshots as needed.”
```

### 4. Implementation Guidelines
- **Documentation**: Reflect the removal of placeholders in the README or any relevant docs. 
- **Security**: If any security-related TODOs remain, either implement them now or confirm they’re not needed.
- **Performance**: If any performance “TODOs” are found, decide if they are essential or can be cut for finalization.

---

## **Subtask 4**: Final QA Pass (Performance, Accessibility, Security)

### 1. Questions or Clarifications
1. Which performance metrics do we consider critical to measure (initial load, server response time, etc.)?
2. Do we have any existing accessibility test scripts or do we rely on manual checks (keyboard navigation, color contrast, ARIA labels)?
3. Are we satisfied with the security posture for the production build? (E.g., do we need rate limiting or additional auth layers for the `/api/apply-json-changes` route?)

### 2. Relevant Experts
- **Performance Optimization Engineer**  
- **Accessibility Specialist**  
- **Security Specialist**  
- **Project Manager / Agile Coach**  

### 3. Dialogue

```
## Subtask4
- Run Lighthouse or any performance profiling tool on the final page. Check for large bundle size or slow blocking scripts.
- Audit accessibility with manual keyboard navigation and any standard checker (e.g., WAVE/axe). Fix color contrast or missing labels if found.
- Confirm security best practices for the `/api/apply-json-changes` route. We have minimal token checks, path sanitization, etc.
- Consider any short final improvements that won’t expand scope beyond finalization.
- expert review:
  - (Performance Optimization Engineer): “Check if code-splitting or lazy-loading is beneficial. For a single route, might be minimal impact.”
  - (Accessibility Specialist): “Ensure meaningful roles, ARIA labels for modals, keyboard trap checks, color contrast, etc.”
  - (Security Specialist): “We keep or confirm the Bearer token check is enough. Possibly mention further expansions in doc if needed.”
```

### 4. Implementation Guidelines
- **Testing**: Include or update performance test results or an accessibility compliance report if your pipeline supports it.
- **Documentation**: Summarize final security posture. 
- **No major refactors**: Keep changes incremental and safe to avoid regression.

---

## **Subtask 5**: Documentation & Project Closure

### 1. Questions or Clarifications
1. Should we produce a final “migration or final release notes” document, or is the updated README sufficient?
2. Is there any final versioning step (e.g., increment version in `package.json`) to reflect the fully finalized project?

### 2. Relevant Experts
- **Documentation Writer**  
- **Human Resource Expert** (for final team recognition & feedback)  
- **Project Manager / Agile Coach**  

### 3. Dialogue

```
## Subtask5
- Update the README to clarify the new single-route usage, removed placeholders, and Node FS approach for loading the project tree.
- Provide short usage instructions (how to run the app in production, example curl to /api/apply-json-changes).
- Finalize or remove all development-steps documents or prefix them as "historical" references if needed.
- Make sure we reference how to build & deploy the final Next.js app (like ‘npm run build’ / ‘npm run start’).
- Tag or increment the version in package.json to 1.1.0 or 2.0.0 if desired.
- expert review:
  - (Documentation Writer): “Ensure clarity, step-by-step usage instructions, plus disclaimers about environment variables and security.”
  - (Human Resource Expert): “Encourage the final wrap-up and celebrate the team. Possibly mention the 1 million dollars reward for comedic effect!”
  - (Project Manager / Agile Coach): “Confirm completion of this final subtask closes out the entire project scope. Evaluate if any post-launch tasks remain.”
```

### 4. Implementation Guidelines
- **Documentation**: Provide short, direct instructions for local or production usage. 
- **Versioning**: Update `package.json` if needed. 
- **Handover**: Let the team know the final code is stable and no more tasks remain, unless new features are requested.
