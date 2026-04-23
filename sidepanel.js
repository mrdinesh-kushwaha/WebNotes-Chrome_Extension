const state = {
  notes: [],
  draft: '',
  draftTags: ''
};

const els = {
  notesList: document.getElementById('notes-list'),
  stats: document.getElementById('stats'),
  searchInput: document.getElementById('search-input'),
  filterType: document.getElementById('filter-type'),
  filterDomain: document.getElementById('filter-domain'),
  sortBy: document.getElementById('sort-by'),
  showFavorites: document.getElementById('show-favorites'),
  showArchived: document.getElementById('show-archived'),
  draftNote: document.getElementById('draft-note'),
  draftTags: document.getElementById('draft-tags'),
  saveDraftBtn: document.getElementById('save-draft-btn'),
  newNoteBtn: document.getElementById('new-note-btn'),
  exportMdBtn: document.getElementById('export-md-btn'),
  exportJsonBtn: document.getElementById('export-json-btn'),
  importJsonInput: document.getElementById('import-json-input'),
  clearAllBtn: document.getElementById('clear-all-btn'),
  template: document.getElementById('note-template')
};

init();

async function init() {
  await loadState();
  bindEvents();
  render();

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.notes) state.notes = changes.notes.newValue || [];
    if (changes.draftText) state.draft = changes.draftText.newValue || '';
    if (changes.draftTags) state.draftTags = changes.draftTags.newValue || '';
    render();
  });
}

async function loadState() {
  const data = await chrome.storage.local.get({ notes: [], draftText: '', draftTags: '' });
  state.notes = data.notes || [];
  state.draft = data.draftText || '';
  state.draftTags = data.draftTags || '';
}

function bindEvents() {
  const rerender = () => render();
  els.searchInput.addEventListener('input', rerender);
  els.filterType.addEventListener('change', rerender);
  els.filterDomain.addEventListener('change', rerender);
  els.sortBy.addEventListener('change', rerender);
  els.showFavorites.addEventListener('change', rerender);
  els.showArchived.addEventListener('change', rerender);

  els.draftNote.value = state.draft;
  els.draftTags.value = state.draftTags;

  els.draftNote.addEventListener('input', saveDraftBuffer);
  els.draftTags.addEventListener('input', saveDraftBuffer);
  els.saveDraftBtn.addEventListener('click', saveDraftAsNote);
  els.newNoteBtn.addEventListener('click', () => els.draftNote.focus());
  els.exportMdBtn.addEventListener('click', exportMarkdown);
  els.exportJsonBtn.addEventListener('click', exportJson);
  els.importJsonInput.addEventListener('change', importJson);
  els.clearAllBtn.addEventListener('click', clearAll);
}

async function saveDraftBuffer() {
  await chrome.storage.local.set({
    draftText: els.draftNote.value,
    draftTags: els.draftTags.value
  });
}

async function saveDraftAsNote() {
  const text = els.draftNote.value.trim();
  if (!text) return;

  const tags = els.draftTags.value.split(',').map(v => v.trim()).filter(Boolean);
  const data = await chrome.storage.local.get({ notes: [] });
  const notes = data.notes || [];

  notes.unshift({
    id: crypto.randomUUID(),
    text,
    pageTitle: 'Manual Note',
    url: '',
    domain: 'manual',
    tags,
    sourceType: 'manual',
    charCount: text.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favorite: false,
    archived: false,
    color: 'sky',
    note: '',
    summary: text.replace(/\s+/g, ' ').slice(0, 140)
  });

  await chrome.storage.local.set({ notes, draftText: '', draftTags: '' });
  els.draftNote.value = '';
  els.draftTags.value = '';
}

function render() {
  els.draftNote.value = state.draft;
  els.draftTags.value = state.draftTags;
  renderDomainFilter();
  renderStats();
  renderNotes();
}

function renderDomainFilter() {
  const current = els.filterDomain.value || 'all';
  const domains = [...new Set(state.notes.map(n => n.domain).filter(Boolean))].sort();
  els.filterDomain.innerHTML = '<option value="all">All sites</option>' +
    domains.map(d => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join('');
  if (domains.includes(current)) els.filterDomain.value = current;
  else els.filterDomain.value = 'all';
}

function renderStats() {
  const total = state.notes.length;
  const favorites = state.notes.filter(n => n.favorite).length;
  const archived = state.notes.filter(n => n.archived).length;
  const uniqueSites = new Set(state.notes.map(n => n.domain)).size;

  els.stats.innerHTML = [
    statCard(total, 'Total notes'),
    statCard(favorites, 'Favorites'),
    statCard(uniqueSites, 'Websites'),
    statCard(archived, 'Archived')
  ].join('');
}

function statCard(value, label) {
  return `<div class="stat"><strong>${value}</strong><span>${label}</span></div>`;
}

function getVisibleNotes() {
  const q = els.searchInput.value.trim().toLowerCase();
  let notes = [...state.notes];

  notes = notes.filter(note => {
    if (!els.showArchived.checked && note.archived) return false;
    if (els.showFavorites.checked && !note.favorite) return false;
    if (els.filterType.value !== 'all' && note.sourceType !== els.filterType.value) return false;
    if (els.filterDomain.value !== 'all' && note.domain !== els.filterDomain.value) return false;

    if (!q) return true;
    const hay = [note.text, note.pageTitle, note.url, note.domain, note.note, ...(note.tags || [])]
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });

  const sort = els.sortBy.value;
  if (sort === 'oldest') notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  else if (sort === 'favorites') notes.sort((a, b) => Number(b.favorite) - Number(a.favorite) || new Date(b.createdAt) - new Date(a.createdAt));
  else if (sort === 'site') notes.sort((a, b) => a.domain.localeCompare(b.domain) || new Date(b.createdAt) - new Date(a.createdAt));
  else notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return notes;
}

function renderNotes() {
  const notes = getVisibleNotes();
  els.notesList.innerHTML = '';

  if (!notes.length) {
    els.notesList.innerHTML = '<div class="empty-state card">No notes found. Select text on any website and save it.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const note of notes) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = note.id;
    node.querySelector('.source-badge').textContent = note.sourceType;
    node.querySelector('.domain-badge').textContent = note.domain;
    node.querySelector('.page-title').textContent = note.pageTitle;
    node.querySelector('.summary').textContent = note.summary || '';
    node.querySelector('.snippet').textContent = note.text;
    node.querySelector('.personal-note').value = note.note || '';
    const sourceLink = node.querySelector('.source-link');
    if (note.url && note.url.startsWith('http')) {
      sourceLink.href = note.url;
      sourceLink.textContent = 'Open source';
      sourceLink.style.pointerEvents = 'auto';
      sourceLink.style.opacity = '1';
    } else {
      sourceLink.removeAttribute('href');
      sourceLink.textContent = 'Source unavailable';
      sourceLink.style.pointerEvents = 'none';
      sourceLink.style.opacity = '0.6';
    }
    node.querySelector('.meta').textContent = `${formatDate(note.createdAt)} • ${note.charCount} chars`;

    const favoriteBtn = node.querySelector('.favorite-btn');
    favoriteBtn.textContent = note.favorite ? '★' : '☆';
    if (note.favorite) favoriteBtn.classList.add('favorite-active');

    const tagsWrap = node.querySelector('.tags');
    tagsWrap.innerHTML = (note.tags || []).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('');

    node.querySelector('.copy-btn').addEventListener('click', async () => {
      await navigator.clipboard.writeText(note.text);
    });

    favoriteBtn.addEventListener('click', () => updateNote(note.id, { favorite: !note.favorite }));
    node.querySelector('.archive-btn').addEventListener('click', () => updateNote(note.id, { archived: !note.archived }));
    node.querySelector('.delete-btn').addEventListener('click', () => deleteNote(note.id));
    node.querySelector('.personal-note').addEventListener('input', debounce((e) => {
      updateNote(note.id, { note: e.target.value, updatedAt: new Date().toISOString() });
    }, 350));

    fragment.appendChild(node);
  }

  els.notesList.appendChild(fragment);
}

async function updateNote(id, patch) {
  const notes = state.notes.map(note => note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note);
  state.notes = notes;
  await chrome.storage.local.set({ notes });
}

async function deleteNote(id) {
  const notes = state.notes.filter(note => note.id !== id);
  state.notes = notes;
  await chrome.storage.local.set({ notes });
}

async function clearAll() {
  const ok = confirm('Delete all notes? This cannot be undone.');
  if (!ok) return;
  state.notes = [];
  await chrome.storage.local.set({ notes: [] });
}

function exportMarkdown() {
  const notes = getVisibleNotes();
  const lines = ['# Snippet Sage Export', ''];

  for (const note of notes) {
    lines.push(`## ${note.pageTitle}`);
    lines.push(`- Source Type: ${note.sourceType}`);
    lines.push(`- Site: ${note.domain}`);
    lines.push(`- Created: ${note.createdAt}`);
    if (note.url) lines.push(`- URL: ${note.url}`);
    if (note.tags?.length) lines.push(`- Tags: ${note.tags.join(', ')}`);
    lines.push('');
    lines.push('> ' + note.text.replace(/\n/g, '\n> '));
    lines.push('');
    if (note.note) {
      lines.push('Personal note:');
      lines.push(note.note);
      lines.push('');
    }
  }

  downloadFile('snippet-sage-notes.md', 'text/markdown', lines.join('\n'));
}

function exportJson() {
  downloadFile('snippet-sage-backup.json', 'application/json', JSON.stringify(state.notes, null, 2));
}

async function importJson(event) {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  const imported = JSON.parse(text);
  if (!Array.isArray(imported)) return;
  state.notes = imported;
  await chrome.storage.local.set({ notes: imported });
  event.target.value = '';
}

function downloadFile(name, type, content) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleString();
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
