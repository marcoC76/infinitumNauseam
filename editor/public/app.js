/* ─── State ─── */
let posts = [];
let currentSlug = null;
let hasUnsaved = false;

/* ─── DOM refs ─── */
const $ = id => document.getElementById(id);
const postList = $('post-list');
const editorTextarea = $('editor-textarea');
const previewContent = $('preview-content');
const metaTitle = $('meta-title');
const metaDate = $('meta-date');
const metaCategories = $('meta-categories');
const metaReadingTime = $('meta-reading-time');
const status = $('status');
const btnNew = $('btn-new');
const btnSave = $('btn-save');
const btnDelete = $('btn-delete');
const modalOverlay = $('modal-overlay');
const modalTitle = $('modal-title');
const modalDate = $('modal-date');
const modalCategories = $('modal-categories');
const modalReadingTime = $('modal-reading-time');
const modalCancel = $('modal-cancel');
const modalConfirm = $('modal-confirm');

/* ─── Toast ─── */
function showToast(msg, isError) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' toast-error' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('toast-visible'));
  setTimeout(() => {
    el.classList.remove('toast-visible');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

/* ─── Status ─── */
function setStatus(msg, isError) {
  status.textContent = msg;
  status.style.color = isError ? 'var(--danger)' : 'var(--text-dim)';
}

/* ─── Renderers ─── */
function renderPostList() {
  let html = '';
  for (const p of posts) {
    const active = p.slug === currentSlug ? 'active' : '';
    const cats = (p.categories || []).map(c =>
      `<span class="post-item-cat">${escHtml(c.trim())}</span>`
    ).join('');
    html += `
      <div class="post-item ${active}" data-slug="${p.slug}">
        <div class="post-item-title">${escHtml(p.title)}</div>
        <div class="post-item-date">${p.date}</div>
        ${cats ? `<div class="post-item-cats">${cats}</div>` : ''}
      </div>
    `;
  }
  postList.innerHTML = html;
}

function updatePreview() {
  if (typeof marked === 'undefined') return;
  try {
    const html = marked.parse(editorTextarea.value || '');
    previewContent.innerHTML = html;
  } catch (e) {
    console.error('Preview error:', e);
  }
}

/* ─── Load posts ─── */
function loadPost(slug) {
  const p = posts.find(x => x.slug === slug);
  if (!p) { console.warn('loadPost: slug not found in list', slug); return; }

  setStatus('cargando…');
  currentSlug = slug;
  btnSave.disabled = true;
  btnDelete.disabled = true;

  fetch(`/api/posts/${encodeURIComponent(slug)}`)
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      metaTitle.value = data.title || '';
      metaDate.value = data.date || '';
      metaCategories.value = (data.categories || []).join(', ');
      metaReadingTime.value = data.reading_time || 1;
      editorTextarea.value = data.content || '';
      hasUnsaved = false;
      updatePreview();
      renderPostList();
      setStatus('listo');
      btnSave.disabled = false;
      btnDelete.disabled = false;
    })
    .catch(err => {
      setStatus('error al cargar', true);
      showToast('Error al cargar el post: ' + err.message, true);
      btnSave.disabled = false;
      btnDelete.disabled = false;
    });
}

function loadPostList() {
  fetch('/api/posts')
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
    .then(data => {
      posts = data;
      renderPostList();
      if (data.length > 0 && !currentSlug) {
        loadPost(data[0].slug);
      } else if (currentSlug) {
        const stillExists = data.find(p => p.slug === currentSlug);
        if (!stillExists && data.length > 0) {
          loadPost(data[0].slug);
        } else {
          renderPostList();
        }
      }
    })
    .catch(err => {
      setStatus('error al cargar posts', true);
      showToast('Error al cargar la lista de posts', true);
    });
}

/* ─── Save ─── */
function savePost() {
  const title = metaTitle.value.trim();
  const date = metaDate.value;
  if (!title || !date) {
    showToast('El título y la fecha son obligatorios', true);
    return;
  }

  btnSave.disabled = true;
  btnSave.textContent = '⏳ Guardando…';
  setStatus('guardando…');

  const body = {
    title,
    date,
    categories: metaCategories.value,
    reading_time: parseInt(metaReadingTime.value) || 1,
    content: editorTextarea.value,
  };

  const method = currentSlug ? 'PUT' : 'POST';
  const url = currentSlug ? `/api/posts/${encodeURIComponent(currentSlug)}` : '/api/posts';

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status: st, data }) => {
      if (st >= 400) throw new Error(data.error || 'Error al guardar');
      if (!currentSlug && data.slug) {
        currentSlug = data.slug;
      }
      hasUnsaved = false;
      showToast('✓ Guardado exitosamente');
      setStatus('guardado ✓');
      btnSave.textContent = '💾 Guardar';
      btnSave.disabled = false;
      loadPostList();
    })
    .catch(err => {
      showToast('Error: ' + err.message, true);
      setStatus('error', true);
      btnSave.textContent = '💾 Guardar';
      btnSave.disabled = false;
    });
}

/* ─── New post ─── */
function showNewPostModal() {
  modalTitle.value = '';
  modalDate.value = new Date().toISOString().split('T')[0];
  modalCategories.value = '';
  modalReadingTime.value = '5';
  modalOverlay.classList.remove('hidden');
  setTimeout(() => modalTitle.focus(), 100);
}

function createNewPost() {
  const title = modalTitle.value.trim();
  const date = modalDate.value;
  if (!title || !date) {
    showToast('El título y la fecha son obligatorios', true);
    return;
  }

  modalConfirm.disabled = true;
  modalConfirm.textContent = '⏳ Creando…';
  setStatus('creando…');

  fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      date,
      categories: modalCategories.value,
      reading_time: parseInt(modalReadingTime.value) || 5,
      content: '',
    }),
  })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status: st, data }) => {
      if (st >= 400) throw new Error(data.error || 'Error al crear');
      currentSlug = data.slug;
      modalOverlay.classList.add('hidden');
      showToast('✓ Post creado');
      setStatus('creado ✓');
      return loadPostList();
    })
    .then(() => {
      if (currentSlug) loadPost(currentSlug);
    })
    .catch(err => {
      showToast('Error: ' + err.message, true);
      setStatus('error', true);
    })
    .finally(() => {
      modalConfirm.disabled = false;
      modalConfirm.textContent = 'Crear';
    });
}

/* ─── Delete ─── */
function deletePost() {
  if (!currentSlug) return;
  if (!confirm('¿Eliminar este relato permanentemente?')) return;

  btnDelete.disabled = true;
  setStatus('eliminando…');

  fetch(`/api/posts/${encodeURIComponent(currentSlug)}`, { method: 'DELETE' })
    .then(r => { if (!r.ok) throw new Error('Error al eliminar'); return r.json(); })
    .then(() => {
      currentSlug = null;
      showToast('✓ Post eliminado');
      setStatus('eliminado');
      btnDelete.disabled = false;
      loadPostList();
    })
    .catch(err => {
      showToast('Error: ' + err.message, true);
      setStatus('error', true);
      btnDelete.disabled = false;
    });
}

/* ─── Helpers ─── */
function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function getToday() {
  const d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/* ─── Events ─── */

postList.addEventListener('click', e => {
  const item = e.target.closest('.post-item');
  if (!item) return;
  const slug = item.dataset.slug;
  if (slug === currentSlug) return;

  if (hasUnsaved) {
    if (!confirm('Tienes cambios sin guardar. ¿Descartarlos?')) return;
  }
  loadPost(slug);
});

editorTextarea.addEventListener('input', () => {
  updatePreview();
  hasUnsaved = true;
  status.textContent = 'sin guardar';
  status.style.color = 'var(--accent)';
});

[metaTitle, metaDate, metaCategories, metaReadingTime].forEach(el => {
  el.addEventListener('input', () => {
    hasUnsaved = true;
    status.textContent = 'sin guardar';
    status.style.color = 'var(--accent)';
  });
});

btnSave.addEventListener('click', savePost);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    savePost();
  }
});

btnNew.addEventListener('click', showNewPostModal);

btnDelete.addEventListener('click', deletePost);

modalCancel.addEventListener('click', () => modalOverlay.classList.add('hidden'));
modalConfirm.addEventListener('click', createNewPost);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
});
modalTitle.addEventListener('keydown', e => {
  if (e.key === 'Enter') createNewPost();
});

/* ─── Init ─── */
loadPostList();
