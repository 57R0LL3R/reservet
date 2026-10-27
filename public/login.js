const $ = (selector) => document.querySelector(selector);

const tokenKey = 'reservet.token';
const userKey = 'reservet.user';

let mode = 'login';
let busy = false;

function setNotice(message = '', isError = true) {
  const element = $('#auth-notice');
  element.textContent = message;
  element.className =
    `auth-notice${message ? (isError ? ' error' : ' success') : ''}`;
}

function setBusy(value) {
  busy = value;

  $('#login-submit').disabled = value;
  $('#register-submit').disabled = value;
  $('#switch-mode').disabled = value;

  $('#login-submit').textContent =
    value && mode === 'login' ? 'Validando…' : 'Iniciar sesión';

  $('#register-submit').textContent =
    value && mode === 'register' ? 'Creando cuenta…' : 'Crear cuenta';
}

function showMode(nextMode) {
  mode = nextMode;

  const registering = mode === 'register';

  $('#login-form').hidden = registering;
  $('#register-form').hidden = !registering;

  $('#auth-title').textContent = registering
    ? 'Crea tu cuenta'
    : 'Bienvenido de nuevo';

  $('#auth-subtitle').textContent = registering
    ? 'Regístrate para empezar a gestionar tu salón.'
    : 'Inicia sesión para gestionar tu salón.';

  $('#switch-copy').textContent = registering
    ? '¿Ya tienes una cuenta?'
    : '¿Todavía no tienes una cuenta?';

  $('#switch-mode').textContent = registering
    ? 'Iniciar sesión'
    : 'Crear cuenta';

  $('#auth-notice').textContent = '';
  $('#auth-notice').className = 'auth-notice';
}

async function apiRequest(path, body) {
  let response;

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new Error(
      'No se pudo contactar al servidor. Comprueba que esté iniciado.'
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    const messages = {
      INVALID_EMAIL: 'Escribe un correo electrónico válido.',
      INVALID_PASSWORD:
        'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.',
      EMAIL_ALREADY_REGISTERED:
        'Ese correo ya está registrado. Inicia sesión.',
      INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
      INVALID_BODY: 'Los datos enviados no son válidos.',
    };

    throw new Error(
      messages[result?.code] ||
      result?.message ||
      `No se pudo completar la solicitud (HTTP ${response.status}).`
    );
  }

  return result;
}

async function submitAuth(event, action) {
  event.preventDefault();

  if (busy) return;

  const form = event.currentTarget;
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;

  if (!email || !form.elements.email.validity.valid) {
    setNotice('Escribe un correo electrónico válido.');
    form.elements.email.focus();
    return;
  }

  if (!password || (action === 'register' && password.length < 8)) {
    setNotice(
      action === 'register'
        ? 'La contraseña debe tener al menos 8 caracteres.'
        : 'Escribe tu contraseña.'
    );

    form.elements.password.focus();
    return;
  }

  setBusy(true);
  setNotice('');

  try {
    const result = await apiRequest(
      `/api/auth/${action}`,
      { email, password }
    );

    if (
      !result?.token ||
      !result?.user ||
      typeof result.user.email !== 'string'
    ) {
      throw new Error(
        'El servidor devolvió una respuesta de autenticación no válida.'
      );
    }

    sessionStorage.setItem(tokenKey, result.token);

    sessionStorage.setItem(
      userKey,
      JSON.stringify({
        id: result.user.id,
        email: result.user.email,
      })
    );

    window.location.replace('/tables.html');
  } catch (error) {
    setNotice(
      error instanceof Error
        ? error.message
        : 'Ocurrió un error inesperado.'
    );
  } finally {
    setBusy(false);
  }
}

$('#login-form').addEventListener(
  'submit',
  (event) => void submitAuth(event, 'login')
);

$('#register-form').addEventListener(
  'submit',
  (event) => void submitAuth(event, 'register')
);

$('#switch-mode').addEventListener('click', () => {
  if (!busy) {
    showMode(mode === 'login' ? 'register' : 'login');
  }
});

// Si ya existe una sesión válida, abre directamente el panel.
const existingToken = sessionStorage.getItem(tokenKey);

if (existingToken) {
  fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${existingToken}`,
    },
    signal: AbortSignal.timeout(8000),
  })
    .then((response) => {
      if (response.ok) {
        window.location.replace('/tables.html');
      } else {
        sessionStorage.removeItem(tokenKey);
        sessionStorage.removeItem(userKey);
      }
    })
    .catch(() => {
      // Si el servidor no responde, se mantiene visible el formulario.
    });
}