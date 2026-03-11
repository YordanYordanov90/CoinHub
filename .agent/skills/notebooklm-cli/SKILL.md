---
name: NotebookLM CLI
description: Interact with Google's NotebookLM via command line using the @roomi-fields/notebooklm-mcp package.
---

# NotebookLM CLI Skill

This skill allows the agent to interact with NotebookLM using the CLI provided by `@roomi-fields/notebooklm-mcp`.

## Prerequisites
- Node.js installed.
- User must be authenticated via `npx @roomi-fields/notebooklm-mcp login`.

## Commands

### 1. Authentication
**Goal**: Log the user in found on the local machine.
**Command**:
```bash
npx -y @roomi-fields/notebooklm-mcp login
```
*Note: This will open a browser window. The user must complete the login there.*

### 2. List Notebooks
**Goal**: See available notebooks.
**Command**:
```bash
npx -y @roomi-fields/notebooklm-mcp notebook list
```

### 3. Query / Research
**Goal**: Ask a question to a specific notebook.
**Command**:
```bash
npx -y @roomi-fields/notebooklm-mcp query <notebook-id> "<your question>"
```

### 4. Create Notebook
**Goal**: Create a new notebook.
**Command**:
```bash
npx -y @roomi-fields/notebooklm-mcp notebook create "<Title>"
```
