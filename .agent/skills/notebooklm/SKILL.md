---
name: NotebookLM
description: Interact with Google's NotebookLM to research topics, summarize documents, and answer questions based on sources.
---

# NotebookLM Skill

This skill provides instructions for using Google's NotebookLM (https://notebooklm.google.com/) to perform research, summarize documents, and generate insights.

## Capabilities

1.  **Create New Notebooks**: Start a fresh research project.
2.  **Add Sources**: Upload documents (PDF, txt, etc.), paste text, or use Google Drive files.
3.  **Query Sources**: Ask questions about the uploaded documents.
4.  **Generate Summaries**: Get high-level overviews of sources.

## Instructions for the Agent

When using this skill, you will primarily use the `browser_subagent` tool to interact with the NotebookLM web interface.

### 1. Prerequisites
- The user must be logged into their Google account.
- The `browser_subagent` must be available.

### 2. Workflow

#### A. accessing NotebookLM
Task: `Navigate to NotebookLM`
Action:
1.  Open the browser and navigate to `https://notebooklm.google.com/`.
2.  Check if the user is logged in. If not, pause and ask the user to log in.

#### B. Creating a Notebook
Task: `Create a new notebook`
Action:
1.  Click on the "New Notebook" or "+" button usually found on the dashboard.
2.  Name the notebook relevant to the research topic.

#### C. Adding Sources
Task: `Add sources to the notebook`
Action:
1.  Locate the "Add Source" section on the left sidebar.
2.  Choose the source type (Drive, PDF upload, Copied text, etc.).
3.  If uploading a file, use the browser's file upload interaction or if pasting text, use the text input.
    *   *Note: Browser subagent has limited file upload capabilities. Pasting text or using Drive links is more reliable.*

#### D. Researching/Querying
Task: `Query the notebook`
Action:
1.  Use the chat input box at the bottom of the screen.
2.  Type the research question or instruction (e.g., "Summarize the key themes", "What does the author say about X?").
3.  Wait for the response and capture it.

## Example Prompts for Browser Subagent

**To create a notebook and research a topic:**
> "Go to notebooklm.google.com, create a new notebook named 'Crypto Regulations', and add the text from these policy documents (I will provide the text). Then, summarize the main points regarding stablecoins."

**To query an existing notebook:**
> "Go to notebooklm.google.com, open the 'Project Alpha' notebook, and ask 'What are the deadlines mentioned in the meeting notes?'"

## Tips
- NotebookLM is powerful for synthesizing information from multiple sources.
- Audio Overviews: You can also generate audio discussions about the content.
- Pinning Citations: When getting answers, look for citations to verify the source.
