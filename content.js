let toolbar;
let hideTimer;

function getSelectedText() {
  return window.getSelection()?.toString().trim() || '';
}

function getParagraphFromSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';

  let node = selection.anchorNode;
  if (!node) return '';
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  const paragraph = node?.closest?.('p, li, article, blockquote, section, div');
  if (!paragraph) return getSelectedText();

  const text = paragraph.innerText?.replace(/\s+/g, ' ').trim() || '';
  return text;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'CAPTURE_NOTE') {
    const text = message.mode === 'paragraph' ? getParagraphFromSelection() : getSelectedText();
    sendResponse({
      ok: Boolean(text),
      text,
      url: location.href,
      pageTitle: document.title,
      sourceType: message.mode === 'paragraph' ? 'paragraph' : 'selection'
    });
  }
});


function ensureToolbar() {
  if (toolbar) return toolbar;

  const existing = document.getElementById('snippet-sage-toolbar');
  if (existing) {
    toolbar = existing;
    return toolbar;
  }

  toolbar = document.createElement('div');
  toolbar.id = 'snippet-sage-toolbar';
  toolbar.innerHTML = `
    <button type="button" data-action="save">Save</button>
    <button type="button" data-action="paragraph">Paragraph</button>
    <button type="button" data-action="panel">Open Notes</button>
  `;
  document.body.appendChild(toolbar);

  toolbar.addEventListener('mousedown', (e) => e.preventDefault());

  toolbar.addEventListener('click', async (e) => {
    const button = e.target.closest('button');
    if (!button) return;

    const action = button.dataset.action;

    if (action === 'panel') {
      try {
        await chrome.runtime.sendMessage({ type: 'OPEN_PANEL' });
      } catch (error) {
        console.error('OPEN_PANEL failed:', error);

        if (String(error).includes('Extension context invalidated')) {
          alert('Extension was reloaded. Please refresh this page once and try again.');
        }
      }
      return;
    }

    const text = action === 'paragraph' ? getParagraphFromSelection() : getSelectedText();
    if (!text) return;

    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Saving...';

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SAVE_NOTE_FROM_CONTENT',
        text,
        url: location.href,
        pageTitle: document.title,
        sourceType: action === 'paragraph' ? 'paragraph' : 'selection'
      });

      button.textContent = response?.ok ? 'Saved' : 'Failed';
    } catch (error) {
      console.error('SAVE_NOTE_FROM_CONTENT failed:', error);

      if (String(error).includes('Extension context invalidated')) {
        button.textContent = 'Reload Page';
        alert('Extension was reloaded. Please refresh this webpage once and try again.');
      } else {
        button.textContent = 'Failed';
      }
    } finally {
      setTimeout(() => {
        button.textContent = original;
        button.disabled = false;
      }, 1000);
    }
  });

  return toolbar;
}

function placeToolbar() {
  const text = getSelectedText();
  if (!text) {
    hideToolbar();
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const el = ensureToolbar();

  el.style.display = 'flex';
  el.style.top = `${window.scrollY + rect.top - 48}px`;
  el.style.left = `${window.scrollX + rect.left}px`;
}

function hideToolbar() {
  if (!toolbar) return;
  toolbar.style.display = 'none';
}

document.addEventListener('selectionchange', () => {
  clearTimeout(hideTimer);
  hideTimer = setTimeout(placeToolbar, 120);
});

document.addEventListener('scroll', hideToolbar, true);
window.addEventListener('resize', hideToolbar);