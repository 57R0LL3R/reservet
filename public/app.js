import { t, locale, applyLanguage } from './i18n.js';

const $ = (selector) => document.querySelector(selector);

const statuses = ['available', 'occupied', 'out_of_service'];
const tokenKey = 'reservet.token';
const userKey = 'reservet.user';

let lastNotice = null;
let formError = null;
let tables = [];
let busy = false;
let loadError = '';

const translatedError = (key, values = {}) =>
  Object.assign(new Error(t(key, values)), { key, values });

const showFormError = (error = null) => {
  formError = error;

  $('#form-error').textContent = error
    ? error.key
      ? t(error.key, error.values)
      : error.message
    : '';
};

const displayName = (table) => table.name;

const notice = (key = '', error = false, values = {}) => {
  lastNotice = { key, error, values };
  $('#notice').textContent = key ? t(key, values) : '';
  $('#notice').className = `notice${error ? ' error' : ''}`;
};

function redirectToLogin() {
  sessionStorage.removeItem(tokenKey);
  sessionStorage.removeItem(userKey);
  window.location.replace('/');
}

async function request(path, options = {}) {
  const token = sessionStorage.getItem(tokenKey);

  if (!token) {
    redirectToLogin();
    throw new Error('Debes iniciar sesión.');
  }

  let response;

  try {
    response = await fetch(path, {
      ...options,
      signal: AbortSignal.timeout(10000),
      headers: {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw translatedError('connectionError');
  }

  const body = await response.json().catch(() => null);

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('La sesión ha expirado. Inicia sesión nuevamente.');
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw translatedError('notFound', { path });
    }

    if (response.status === 409) {
      throw translatedError('duplicate');
    }

    const error = new Error(
      body?.message || t('httpError', { status: response.status })
    );

    error.key = body?.code ? null : 'httpError';
    error.values = { status: response.status };

    throw error;
  }

  return body;
}

function validTable(table) {
  return (
    table &&
    Number.isInteger(table.id) &&
    table.id > 0 &&
    typeof table.name === 'string' &&
    table.name.trim().length > 0 &&
    table.name.length <= 80 &&
    Number.isInteger(table.capacity) &&
    table.capacity >= 1 &&
    table.capacity <= 20 &&
    statuses.includes(table.status)
  );
}

function setBusy(value) {
  busy = value;

  for (const selector of [
    '#refresh',
    '#new-table',
    '#save-table',
    '#close-dialog',
    '#cancel-dialog',
  ]) {
    $(selector).disabled = value;
  }

  $('#tables').setAttribute('aria-busy', String(value));

  $('#save-table').textContent = t(value ? 'saving' : 'save');

  document.querySelectorAll('.card-bottom select').forEach((select) => {
    select.disabled = value;
  });
}

const tableIcon = `
  <svg viewBox="0 0 32 32"
       fill="none"
       stroke="currentColor"
       stroke-width="1.5"
       aria-hidden="true">
    <rect x="8" y="8" width="16" height="16" rx="3"/>
    <path d="M12 4h8M12 28h8M4 12v8M28 12v8"
          stroke-linecap="round"/>
  </svg>
`;

function render() {
  $('#total').textContent = tables.length;

  for (const status of statuses) {
    $(`#${status}`).textContent = tables.filter(
      (table) => table.status === status
    ).length;
  }

  const query = $('#search').value.trim().toLocaleLowerCase(locale());
  const filter = $('#filter').value;

  const filtered = tables.filter((table) =>
    displayName(table).toLocaleLowerCase(locale()).includes(query) &&
    (filter === 'all' || table.status === filter)
  );

  $('#result-count').textContent = t('results', {
    shown: filtered.length,
    total: tables.length,
    source: t('apiData'),
  });

  $('#tables').replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';

    const title = document.createElement('h3');
    title.textContent = t(
      loadError
        ? 'errorTitle'
        : tables.length
          ? 'noMatches'
          : 'emptyTitle'
    );

    const description = document.createElement('p');
    description.textContent = t(
      loadError
        ? 'errorHint'
        : tables.length
          ? 'searchHint'
          : 'emptyHint'
    );

    empty.append(title, description);
    $('#tables').append(empty);
  }

  for (const table of filtered) {
    const card = document.createElement('article');
    card.className = 'table-card';

    card.innerHTML = `
      <div class="card-top">
        <span class="table-symbol"></span>
        <span class="badge"></span>
      </div>
      <div class="card-body">
        <h3></h3>
        <p></p>
      </div>
      <div class="card-bottom">
        <label></label>
        <select></select>
      </div>
    `;

    card.querySelector('.table-symbol').innerHTML = tableIcon;

    const badge = card.querySelector('.badge');
    badge.classList.add(table.status);
    badge.textContent = t(table.status);

    card.querySelector('h3').textContent = displayName(table);

    card.querySelector('.card-body p').textContent = t('seats', {
      count: table.capacity,
    });

    const select = card.querySelector('select');
    select.id = `status-${table.id}`;

    const label = card.querySelector('label');
    label.htmlFor = select.id;
    label.textContent = t('changeStatus');

    select.setAttribute(
      'aria-label',
      t('statusOf', { name: displayName(table) })
    );

    for (const value of statuses) {
      select.add(new Option(t(value), value));
    }

    select.value = table.status;
    select.disabled = busy;

    select.addEventListener('change', () => {
      void changeStatus(table, select.value);
    });

    $('#tables').append(card);
  }
}

async function load() {
  if (busy) return;

  loadError = '';
  tables = [];

  setBusy(true);
  render();
  notice('loading');

  try {
    const result = await request('/api/tables');

    if (
      !Array.isArray(result) ||
      !result.every(validTable) ||
      new Set(result.map((table) => table.id)).size !== result.length
    ) {
      throw translatedError('invalidList');
    }

    tables = result;
    notice('loaded');
  } catch (error) {
    if (window.location.pathname === '/') return;

    loadError = error;

    notice(
      error.key || 'httpError',
      true,
      error.values || { status: '' }
    );
  } finally {
    setBusy(false);
    render();
  }
}

async function changeStatus(table, status) {
  if (busy || !statuses.includes(status)) return;

  setBusy(true);

  try {
    const updated = await request(
      `/api/tables/${table.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );

    if (
      !validTable(updated) ||
      updated.id !== table.id ||
      updated.status !== status
    ) {
      throw translatedError('invalidPatch');
    }

    tables = tables.map((item) =>
      item.id === updated.id ? updated : item
    );

    notice('updated', false, {
      name: displayName(table),
    });
  } catch (error) {
    notice(
      error.key || 'httpError',
      true,
      error.values || { status: '' }
    );
  } finally {
    setBusy(false);
    render();
  }
}

async function createTable(event) {
  event.preventDefault();

  if (busy) return;

  const name = $('#table-name').value.trim();
  const capacity = Number($('#table-capacity').value);

  showFormError();

  if (
    !name ||
    name.length > 80 ||
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 20
  ) {
    showFormError(translatedError('validation'));
    return;
  }

  setBusy(true);

  try {
    const created = await request('/api/tables', {
      method: 'POST',
      body: JSON.stringify({ name, capacity }),
    });

    if (
      !validTable(created) ||
      tables.some((table) => table.id === created.id)
    ) {
      throw translatedError('invalidPost');
    }

    tables.push(created);
    loadError = '';

    $('#search').value = '';
    $('#filter').value = 'all';
    $('#table-dialog').close();

    notice('created', false, { name });
  } catch (error) {
    showFormError(error);
  } finally {
    setBusy(false);
    render();
  }
}

function updateLanguage() {
  applyLanguage($('#language').value);

  $('#mode-description').textContent = t('apiDescription');

  setBusy(busy);
  render();

  if (lastNotice) {
    notice(
      lastNotice.key,
      lastNotice.error,
      lastNotice.values
    );
  }

  showFormError(formError);
}

async function start() {
  const token = sessionStorage.getItem(tokenKey);

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      redirectToLogin();
      return;
    }

    const body = await response.json();

    if (body?.user?.email) {
      sessionStorage.setItem(
        userKey,
        JSON.stringify({
          id: body.user.id,
          email: body.user.email,
        })
      );
    }
  } catch {
    notice('connectionError', true);
  }

  void load();
}

// Abrir el formulario para crear una mesa.
$('#new-table').addEventListener('click', () => {
  $('#table-form').reset();
  showFormError();
  $('#table-dialog').showModal();
  $('#table-name').focus();
});

// Cerrar o cancelar el formulario.
for (const selector of ['#close-dialog', '#cancel-dialog']) {
  $(selector).addEventListener('click', () => {
    $('#table-dialog').close();
  });
}

$('#table-dialog').addEventListener('cancel', (event) => {
  if (busy) event.preventDefault();
});

// Eventos del panel.
$('#table-form').addEventListener('submit', (event) => {
  void createTable(event);
});

$('#refresh').addEventListener('click', () => {
  void load();
});

$('#search').addEventListener('input', render);
$('#filter').addEventListener('change', render);
$('#language').addEventListener('change', updateLanguage);
$('#logout').addEventListener('click', redirectToLogin);

// Inicialización.
applyLanguage();
updateLanguage();

void start().then(() => {
  if (sessionStorage.getItem(tokenKey)) {
    $('#refresh').click();
  }
});