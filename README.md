# Project Prompt

<!-- TODO: We'll update these docs to reflect Next.js usage once the migration is complete. -->

A React-based application that loads and manipulates files from a selected directory via the File System Access API. It generates comprehensive prompts by combining user instructions, custom instructions, and file contents, then allows applying XML-based code changes back to the directory.

## Table of Content

- [Project Prompt](#project-prompt)
  - [Table of Content](#table-of-content)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Main Components](#main-components)
    - [Stores](#stores)
    - [Theming](#theming)
  - [Applying XML Changes](#applying-xml-changes)
  - [Contribution](#contribution)
  - [License](#license)

## Features

- **Directory Selection**: Select a folder from your local system using the File System Access API and display the directory tree structure.
- **File Loading**: Filter files using ignore patterns, then load selected files to be appended in the final prompt.
- **Custom Instructions**: Create, edit, delete, reorder, and toggle custom instructions to be appended before or after your main instructions.
- **Prompt Generation**: Merge user instructions, custom instructions, and file contents into a single prompt (with an option to include a tree representation of the files).
- **XML-based Changes**: Apply changes (create/update/delete) to the directory using a custom XML-based format.
- **Toast Notifications**: Global snackbar for success and error messages.
- **Light/Dark Theme**: Switch between light and dark MUI themes.

## Installation

Use a modern JavaScript package manager and dev server tool. The project is structured with a `package.json` that includes dependencies like `React`, `@mui/material`, `zustand`, `@dnd-kit/core`, `js-tiktoken`, `vite`, and so forth. Typical steps might include installing dependencies and running the development server. For example:

1. Clone or download the repository.
2. From the project root, install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:5173 (or as indicated in the console) in a web browser.

_(Adjust package manager commands and dev script names as needed.)_

## Usage

1. Click the **Open** button under **Directory Structure** to choose a folder.
2. Use the **Ignore Patterns** input to exclude certain files/folders (e.g., `dist/**` or `node_modules`).
3. Select or unselect files/folders in the tree. You can clear all selections at any time.
4. Click **Load Files** to read their contents into the **Loaded Files** list on the right.
5. Optionally add instructions in the **Instructions** field. You can also open the **Custom Instructions** modal (via the settings icon at the top-right of the instructions bar) to create, edit, or reorder additional instructions that automatically append to your final prompt.
6. Click **Copy Prompt** or **Full Prompt** to see or copy the fully combined prompt.
7. (Optional) Apply XML changes to your directory by clicking the **Apply Changes** button in the top app bar and providing a valid XML structure that details file operations.

## Main Components

**The application is composed of interconnected React components and Zustand stores, plus utilities for token counting and ignoring files.**

1. **App.tsx**: The main layout container, organizes the two-pane interface, top bar, and integrated modals.
2. **Modals** (in `src/components/modals`):

   - `ApplyChangesModal.tsx` references an XML snippet for code changes and applies them to the loaded directory.
   - `CustomInstructionsModal.tsx` manages adding/editing custom instructions in local storage.
   - `Modal.tsx` is a simple custom modal layout.
   - `SortableCustomInstructionItem.tsx` handles drag-and-drop functionality for reordering custom instructions.

3. **UI Components**:
   - `DirectoryTree.tsx`, `IgnoreInput.tsx`, `SelectedFilesList.tsx` manage directory file selection, ignore patterns, and loaded file lists.
   - `GlobalSnackbar.tsx` handles global toast notifications.
   - `InstructionsField.tsx` merges main instructions with loaded files for the final prompt generation.
   - `PromptGenerator.tsx` displays the combined prompt and token count, with a copy function.
   - `CustomInstructionsBar.tsx` organizes the display of custom instructions above the main instructions.

### Stores

There are multiple Zustand stores under `src/store`:

- **fileStore.ts**: Deals with selecting/opening directories, building file trees, ignoring patterns, and loading file contents.
- **instructionsStore.ts**: Manages the main instructions content and provides the final prompt by merging loaded files plus custom instructions.
- **customInstructionsStore.ts**: Handles create/update/delete/toggle functionality for user-defined custom instructions, along with drag-and-drop reordering.
- **toastStore.ts**: Manages a global snackbar for success/error messages.
- **themeStore.ts**: Switches between light and dark modes.

### Theming

- **themeStore.ts** holds a boolean mode (`light` or `dark`) that toggles the theme.
- **theme.ts** in `src/styles` and `muiTheme.ts` define MUI-based theming, customizing color palettes, backgrounds, and some overrides (e.g., scrollbar styling).

## Applying XML Changes

`ApplyChangesModal.tsx` expects an XML structure containing file operations (`CREATE`, `UPDATE`, `DELETE`) and applies them to the selected directory. Each `<file>` element has:

- `<file_operation>`: One of `CREATE`, `UPDATE`, or `DELETE`.
- `<file_path>`: The relative path of the file to act on.
- `<file_code>`: (Only for `CREATE` or `UPDATE`) The new content.

**Usage**:

1. Open the **Apply Changes** modal from the top bar.
2. Paste or edit valid XML under `<code_changes>`.
3. Submit to create, update, or delete the specified files in the open directory.

## Contribution

Contributions are welcomed! To contribute:

1. Fork this repository and make a new branch for your feature or bugfix.
2. Write clear, concise code referencing the existing style and structure.
3. Submit a pull request with a detailed description of changes.
4. Participate in code review and discussions as needed.

## License

This project is licensed under the **AGPL v3 License**. It’s publicly available. Others are welcome to contribute to it, provided they abide by the simple, permissive terms of AGPL.
