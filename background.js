const MENU_IDS = {
  SAVE_SELECTION: 'snippet-sage-save-selection',
  SAVE_PARAGRAPH: 'snippet-sage-save-paragraph',
  OPEN_PANEL: 'snippet-sage-open-panel'
};

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_SELECTION,
    title: 'Save selected text to WebNotes',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: MENU_IDS.SAVE_PARAGRAPH,
    title: 'Save paragraph near selection',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: MENU_IDS.OPEN_PANEL,
    title: 'Open Snippet Sage',
    contexts: ['page', 'selection']
  });

  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-side-panel') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.windowId) return;
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id || !tab.windowId) return;

  if (info.menuItemId === MENU_IDS.OPEN_PANEL) {
    await chrome.sidePanel.open({ windowId: tab.windowId });
    return;
  }

  const mode = info.menuItemId === MENU_IDS.SAVE_PARAGRAPH ? 'paragraph' : 'selection';

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'CAPTURE_NOTE',
      mode
    });

if (response?.ok) {
  const finalUrl = response.url || tab.url || (tab.id ? `tab-${tab.id}` : '');

  await saveNote({
    text: response.text,
    pageTitle: response.pageTitle || tab.title || 'Untitled',
    url: finalUrl,
    tags: generateTags(finalUrl),
    sourceType: response.sourceType,
    charCount: response.text.length
  });
  await chrome.sidePanel.open({ windowId: tab.windowId });
}
  } catch (error) {
    console.error('Failed to capture note:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
if (message?.type === 'SAVE_NOTE_FROM_CONTENT') {
  const tab = sender.tab;
  const finalUrl = message.url || tab?.url || '';

  saveNote({
    text: message.text,
    pageTitle: message.pageTitle || tab?.title || 'Untitled',
    url: finalUrl,
    tags: generateTags(finalUrl),
    sourceType: message.sourceType || 'selection',
    charCount: message.text?.length || 0
  })
      .then(() => sendResponse({ ok: true }))
      .catch((error) => {
        console.error(error);
        sendResponse({ ok: false });
      });
    return true;
  }

  if (message?.type === 'OPEN_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      if (tab?.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
      sendResponse({ ok: true });
    });
    return true;
  }
});

async function saveNote(payload) {
  const data = await chrome.storage.local.get({ notes: [] });
  const notes = data.notes || [];

  const text = (payload.text || '').trim();
  if (!text) return;

  const cleanUrl = (payload.url || '').trim();

  const newNote = {
    id: crypto.randomUUID(),
    text,
    pageTitle: payload.pageTitle || 'Untitled',
    url: cleanUrl,
    domain: safeDomain(cleanUrl),
    tags: Array.from(new Set((payload.tags || []).filter(Boolean))),
    sourceType: payload.sourceType || 'selection',
    charCount: payload.charCount || text.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
    archived: false,
    color: pickColor(cleanUrl),
    note: '',
    summary: makeSummary(text)
  };

  notes.unshift(newNote);
  await chrome.storage.local.set({ notes });
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function generateTags(url) {
  const domain = safeDomain(url);
  const base = domain.split('.').filter(Boolean)[0] || 'web';
  return [base, 'reading'];
}

function pickColor(url = '') {
  const colors = ['sunset', 'mint', 'sky', 'lavender', 'peach'];
  let hash = 0;
  for (const ch of url) {
    hash = (hash + ch.charCodeAt(0)) % colors.length;
  }
  return colors[hash];
}

function makeSummary(text = '') {
  return text.replace(/\s+/g, ' ').trim().slice(0, 140);
}