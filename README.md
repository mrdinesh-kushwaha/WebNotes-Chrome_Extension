# WebNotes - Chrome Extension

WebNotes – Capture & Save Website Notes is a Chrome extension that lets you save selected text or the surrounding paragraph from any website and manage everything in a persistent side panel.

## 📌 Why did I create this Chrome Extension?✅

While learning from blogs, documentation, and tutorials, it is often difficult to quickly save important content without switching between applications.

WebNotes solves this problem by allowing users to capture useful content directly from any webpage and store it instantly for future reference.

---

## 🔮 Features

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

---

### 🔹Working Demo


#### 1.1 Text Selection with Floating Toolbar
![Text Selection and Toolbar](screenshots/image1.1.png)

#### 1.2 Notes Saved / Output View
![Saved Notes Output](screenshots/image1.2.png)

### 🔹 How to Use the Extension (Step by Step)

#### 2.0 Open Chrome Extensions Page / Enable Developer Mode
![Open Chrome Extensions](screenshots/image2.0.png)

#### 2.1 Enable Developer Mode ( ON )
![Enable Developer Mode](screenshots/image2.1.png)

#### 2.2 Click Load Unpacked
![Click Load Unpacked](screenshots/image2.2.png)

#### 2.3 Select the Project Folder
![Select Project Folder](screenshots/image2.3.png)

#### 2.4 Extension Loaded Successfully with Icon
![Extension Loaded with Icon](screenshots/image2.4.png)

#### 2.5 Extension Home / Main View
![Extension Home](screenshots/image2.5.png)

---

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
5. Select the `WebNotes` folder.
6. Pin the extension from the Chrome toolbar.
7. Open any website.
8. Select text and either:
   - right click -> **Save selected text to WebNotes – Capture & Save Website Notes**
   - right click -> **Save paragraph near selection**
   - use the floating toolbar -> **Save** or **Paragraph**
9. Click the extension icon to open the side panel.

## Possible Future Improvements

- AI summary / auto-tag generation.
- Folder system and collections.
- Sync across devices with `chrome.storage.sync` for lightweight metadata.
- Screenshot capture with `chrome.tabs.captureVisibleTab()`.
- IndexedDB for very large note collections.
=======

---

## 🏗️ Architecture

This extension is built using Chrome Extension Manifest V3 architecture.

### Components:

### 1. Content Script (`content.js`)
- Runs inside web pages
- Captures selected text or paragraph
- Displays floating toolbar

### 2. Background Script (`background.js`)
- Handles context menu actions
- Manages message passing
- Stores notes using Chrome Storage API

### 3. Side Panel (`sidepanel.html`, `sidepanel.js`)
- Displays saved notes
- Provides search, filter, and note actions

---

## 🔄 Data Flow

User selects text → Content Script captures → Message sent → Background Script processes → Data stored → Side Panel displays notes

---

## 🛠 Tech Stack

- JavaScript (ES6+)
- HTML5
- CSS3
- Chrome Extensions API
- Manifest V3
- chrome.storage.local

---

## 📂 Project Structure

webnotes/
│── manifest.json  
│── background.js  
│── content.js  
│── sidepanel.html  
│── sidepanel.css  
│── sidepanel.js  
│── icons/  
│── README.md  

---

## ⚙️ Installation (Local Setup)

1. Clone this repository:
git clone https://github.com/mrdinesh-kushwaha/WebNotes-Chrome_Extension/

2. Open Chrome and go to:
chrome://extensions/

3. Enable **Developer Mode**

4. Click **Load Unpacked**

5. Select the project folder

---

## 🚀 Usage

1. Open any website  
2. Select text  
3. Click floating **Save** button or use right-click menu  
4. Open side panel to view saved notes  

---

## 🧠 Challenges Faced

- Managing communication between content script and background script  
- Handling persistent storage across sessions  
- Avoiding extension context invalidation issues  
- Designing scalable UI using side panel instead of popup  

---

## 💡 Learnings

- Chrome Extension architecture (Manifest V3)  
- Content scripts & service workers  
- Message passing between components  
- DOM manipulation and event handling  
- Persistent storage using Chrome APIs  

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 🙌 Author

**Dinesh Kushwaha**

- 💼 Software Engineer (Backend / Java)  
- 📧 dineshkushwaha1312@gmail.com  
- 🔗 https://www.linkedin.com/in/mrdinesh-kushwaha/
