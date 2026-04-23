# WebNotes – Capture & Save Website Notes - Chrome Extension

WebNotes – Capture & Save Website Notes is a Chrome extension that lets you save selected text or the surrounding paragraph from any website and manage everything in a persistent side panel.

## Features

- Save selected text from any website.
- Save the full paragraph near the selected text.
- Floating mini-toolbar appears when you select text.
- Right-click context menu support.
- Persistent storage using `chrome.storage.local`.
- Manual note composer with auto-saved draft.
- Favorite, archive, search, filter, and sort notes.
- Export notes to Markdown.
- Backup and restore with JSON import/export.
- Source URL, page title, domain, timestamps, and tags.
- Keyboard shortcut to open side panel.

## Project Structure

snippet-sage/
├── manifest.json
├── background.js
├── content.js
├── content.css
├── sidepanel.html
├── sidepanel.css
├── sidepanel.js
├── README.md
└── icons/

## How to Run

1. Open Chrome.
2. Go to `chrome://extensions/`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `snippet-sage` folder.
6. Pin the extension from the Chrome toolbar.
7. Open any website.
8. Select text and either:
   - right click -> **Save selected text to WebNotes – Capture & Save Website Notes**
   - right click -> **Save paragraph near selection**
   - use the floating toolbar -> **Save** or **Paragraph**
9. Click the extension icon to open the side panel.

## Interview Talking Points

- Built with **Manifest V3** and **service worker architecture**.
- Used **content scripts** for webpage text extraction.
- Used **chrome.storage.local** for persistent offline storage.
- Designed a **side-panel based UX** instead of a basic popup for better long-form note management.
- Added **manual draft autosave**, **Markdown export**, and **JSON backup/restore** to make the product practical.
- Implemented multiple note sources: selected text, paragraph capture, and manual notes.
- Focused on real product thinking, not just API usage.

## Possible Future Improvements

- AI summary / auto-tag generation.
- Folder system and collections.
- Sync across devices with `chrome.storage.sync` for lightweight metadata.
- Screenshot capture with `chrome.tabs.captureVisibleTab()`.
- IndexedDB for very large note collections.
