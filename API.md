# Project Prompt API Reference

This document describes the API endpoints available in Project Prompt CLI.

## Base URL

When running locally via the CLI, all API endpoints are available at:

```
http://localhost:3000/api/
```

## Directory Operations

### List Directory

Lists the directory structure of the project root.

- **URL**: `/list-directory`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "tree": [
      {
        "name": "file.txt",
        "type": "file",
        "relativePath": "file.txt"
      },
      {
        "name": "directory",
        "type": "directory",
        "relativePath": "directory",
        "children": [...]
      }
    ],
    "rootDirName": "project-name"
  }
  ```

### List Directory (SSE)

Get real-time updates on file changes using Server-Sent Events (SSE).

- **URL**: `/list-directory`
- **Method**: `GET`
- **Headers**: `Accept: text/event-stream`
- **Response**: SSE stream with the same format as the List Directory endpoint

## File Operations

### Get File Contents

Retrieves the contents of a file.

- **URL**: `/get-file-contents`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "path": "relative/path/to/file.txt"
  }
  ```
- **Response**:
  ```json
  {
    "content": "File content as string"
  }
  ```

### Apply JSON Changes

Apply changes to files in the project.

- **URL**: `/apply-json-changes`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "changes": [
      {
        "type": "create",
        "path": "path/to/new-file.txt",
        "content": "File content"
      },
      {
        "type": "delete",
        "path": "path/to/file-to-delete.txt"
      },
      {
        "type": "complete_update",
        "path": "path/to/update.txt",
        "content": "New content"
      },
      {
        "type": "partial_update",
        "path": "path/to/update.txt",
        "content": "Content to append",
        "append": true
      },
      {
        "type": "rename_move",
        "oldPath": "path/to/old.txt",
        "newPath": "path/to/new.txt"
      }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Changes applied successfully",
    "results": [
      {
        "type": "create",
        "path": "path/to/new-file.txt",
        "status": "success"
      },
      ...
    ]
  }
  ```

## Configuration

### Get Configuration

Get the current Project Prompt configuration.

- **URL**: `/pjp-config`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "instructions": "...",
    "customInstructions": [...],
    "selectedPaths": [...],
    "excludedPaths": [...],
    "ignorePatterns": "...",
    "includeTreeInPrompt": true,
    "themeMode": "dark"
  }
  ```

### Save Configuration

Save the Project Prompt configuration.

- **URL**: `/pjp-config`
- **Method**: `POST`
- **Body**: Configuration object (same format as the GET response)
- **Response**:
  ```json
  {
    "success": true,
    "message": "Configuration saved successfully"
  }
  ```

## Error Handling

All endpoints return error responses in the following format:

```json
{
  "error": "Error message"
}
```

With an appropriate HTTP status code (400, 404, 500, etc.).
