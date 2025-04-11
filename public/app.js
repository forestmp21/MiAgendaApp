const servidor = 'http://localhost:3000';

// Verificación de sesión
const usuarioActual = localStorage.getItem('usuario');
const token = localStorage.getItem('token');

// Redirige si no hay sesión
if (window.location.pathname.includes('tareas.html') && !token) {
  window.location.href = 'index.html';
}

// ------------------------------
// AUTENTICACIÓN
// ------------------------------

function iniciarSesion() {
  const usuario = document.getElementById('loginUsuario').value;
  const contraseña = document.getElementById('loginClave').value;

  fetch(`${servidor}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contraseña })
  })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('usuario', usuario);
        localStorage.setItem('token', data.token);
        window.location.href = 'tareas.html';
      } else {
        alert(data.mensaje || 'Credenciales inválidas');
      }
    });
}

function registrarse() {
  const usuario = document.getElementById('regUsuario').value;
  const contraseña = document.getElementById('regClave').value;

  fetch(`${servidor}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contraseña })
  })
    .then(res => res.json())
    .then(data => alert(data.mensaje));
}

function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// ------------------------------
// FUNCIONES DE TAREAS
// ------------------------------

function crearTarea() {
  const titulo = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;

  if (!titulo.trim()) return alert('Debes escribir un título');

  fetch(`${servidor}/tareas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({ titulo, descripcion })
  })
    .then(() => {
      document.getElementById('titulo').value = '';
      document.getElementById('descripcion').value = '';
      cargarTareas();
    });
}

function cargarTareas() {
  fetch(`${servidor}/tareas`, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  })
    .then(res => res.json())
    .then(tareas => {
      const lista = document.getElementById('listaTareas');
      lista.innerHTML = '';
      tareas.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
          <b>${t.titulo}</b> - ${t.descripcion} 
          [${t.completada ? '✔️' : '❌'}]
          <button onclick="completar('${t._id}')">✓</button>
          <button onclick="eliminar('${t._id}')">🗑️</button>
        `;
        lista.appendChild(li);
      });
    });
}

function completar(id) {
  fetch(`${servidor}/tareas/${id}/completar`, {
    method: 'PATCH',
    headers: {
      'Authorization': token
    }
  }).then(() => cargarTareas());
}

function eliminar(id) {
  fetch(`${servidor}/tareas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  }).then(() => cargarTareas());
}

// ------------------------------
// AUTO CARGA
// ------------------------------

if (window.location.pathname.includes('tareas.html')) {
  cargarTareas();

  // Agrega botón de cerrar sesión si quieres (opcional)
  const btnSalir = document.createElement('button');
  btnSalir.textContent = 'Cerrar sesión';
  btnSalir.onclick = cerrarSesion;
  document.body.appendChild(btnSalir);
}
