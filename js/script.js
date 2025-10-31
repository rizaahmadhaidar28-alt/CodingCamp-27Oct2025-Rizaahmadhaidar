
(function () {
  const form = document.getElementById('todo-form');
  const titleInput = document.getElementById('title');
  const dateInput = document.getElementById('dueDate');
  const listEl = document.getElementById('todo-list');
  const searchInput = document.getElementById('search');
  const filterDate = document.getElementById('filter-date');
  const clearFilterBtn = document.getElementById('clear-filter');
  const clearAllBtn = document.getElementById('clear-all');

  const TITLE_ERROR = document.getElementById('title-error');
  const DATE_ERROR = document.getElementById('date-error');

  const STORAGE_KEY = 'taskflow_v1';

  let todos = loadTodos();

  // Render initial
  renderList();

  // Form submit -> add todo
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const title = titleInput.value.trim();
    const due = dateInput.value;

    let hasError = false;
    if (!title) {
      TITLE_ERROR.textContent = 'Task must not be empty.';
      hasError = true;
    }
    if (!due) {
      DATE_ERROR.textContent = 'Please choose a due date.';
      hasError = true;
    }
    if (hasError) return;

    const newItem = {
      id: Date.now().toString(36),
      title,
      due,
      createdAt: new Date().toISOString()
    };
    todos.unshift(newItem); // newest on top
    saveTodos();
    renderList();
    form.reset();
    titleInput.focus();
  });

  // search & filter events
  searchInput.addEventListener('input', renderList);
  filterDate.addEventListener('change', renderList);
  clearFilterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    filterDate.value = '';
    searchInput.value = '';
    renderList();
  });

  clearAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!confirm('Delete ALL tasks? This cannot be undone.')) return;
    todos = [];
    saveTodos();
    renderList();
  });

  // Helper: load / save
  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Failed parse storage', err);
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  // Render list according to filters
  function renderList() {
    const q = (searchInput.value || '').trim().toLowerCase();
    const fd = filterDate.value; // yyyy-mm-dd
    listEl.innerHTML = '';

    const filtered = todos.filter(item => {
      const matchesQ = !q || item.title.toLowerCase().includes(q);
      const matchesDate = !fd || item.due === fd;
      return matchesQ && matchesDate;
    });

    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'todo-item';
      empty.innerHTML = `<div class="todo-left"><div><strong class="todo-title">No tasks found</strong><div class="todo-meta">Try adding a task or clearing filters.</div></div></div>`;
      listEl.appendChild(empty);
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = item.id;

      const dueFormatted = formatDate(item.due);
      const created = formatRelative(item.createdAt);

      li.innerHTML = `
        <div class="todo-left">
          <div>
            <div class="todo-title">${escapeHtml(item.title)}</div>
            <div class="todo-meta">Due: ${dueFormatted} • Added ${created}</div>
          </div>
        </div>
        <div class="todo-actions">
          <button class="icon-btn" title="Copy task" data-action="copy">📋</button>
          <button class="icon-btn" title="Delete task" data-action="delete">🗑️</button>
        </div>
      `;

      // action listeners
      li.querySelector('[data-action="delete"]').addEventListener('click', () => {
        removeTodo(item.id);
      });
      li.querySelector('[data-action="copy"]').addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(`${item.title} — due ${dueFormatted}`);
          showToast('Task copied to clipboard');
        } catch (err) {
          showToast('Copy failed');
        }
      });

      listEl.appendChild(li);
    });
  }

  function removeTodo(id) {
    if (!confirm('Hapus tugas ini?')) return;
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderList();
  }

  // small utilities
  function formatDate(iso) {
    try {
      const [y,m,d] = iso.split('-');
      const dt = new Date(iso + 'T00:00:00');
      const opts = { year: 'numeric', month: 'short', day: 'numeric' };
      return dt.toLocaleDateString(undefined, opts);
    } catch {
      return iso;
    }
  }

  function formatRelative(isoTime) {
    const now = Date.now();
    const then = new Date(isoTime).getTime();
    const diff = Math.round((now - then) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.round(diff/60)}m ago`;
    if (diff < 86400) return `${Math.round(diff/3600)}h ago`;
    return `${Math.round(diff/86400)}d ago`;
  }

  function clearErrors() {
    TITLE_ERROR.textContent = '';
    DATE_ERROR.textContent = '';
  }

  // very small escape to avoid HTML injection into title
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // tiny toast using aria-live
  function showToast(msg) {
    let td = document.getElementById('app-toast');
    if (!td) {
      td = document.createElement('div');
      td.id = 'app-toast';
      td.setAttribute('aria-live', 'polite');
      td.style.position = 'fixed';
      td.style.right = '18px';
      td.style.bottom = '18px';
      td.style.padding = '10px 14px';
      td.style.borderRadius = '8px';
      td.style.background = 'rgba(10,12,16,0.8)';
      td.style.color = '#fff';
      td.style.zIndex = 9999;
      document.body.appendChild(td);
    }
    td.textContent = msg;
    td.style.opacity = '1';
    setTimeout(() => {
      td.style.opacity = '0';
    }, 1500);
  }

})();
