// ✅ URL de tu backend en Render
const servidor = 'https://miagenda-backend.onrender.com';

// 🔐 Token y usuario guardados localmente
let usuarioActual = localStorage.getItem('usuario');
let token = localStorage.getItem('token');

// Redirigir si no hay sesión activa
if (window.location.pathname.includes('tareas.html') && !token) {
  window.location.href = 'index.html';
}

// ------------------------------
// REGISTRO
// ------------------------------
function registrarse() {
  const usuario = document.getElementById('regUsuario').value;
  const contraseña = document.getElementById('regClave').value;

  if (!usuario || !contraseña) {
    return alert('Debes llenar ambos campos');
  }

  fetch(`${servidor}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ usuario, contraseña })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mensaje);
    })
    .catch(err => {
      console.error('Error en el registro:', err);
      alert('No se pudo registrar. Revisa la consola.');
    });
}

// ------------------------------
// LOGIN
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
        alert(data.mensaje || 'Credenciales incorrectas');
      }
    })
    .catch(err => {
      console.error('Error en el login:', err);
      alert('Ocurrió un error al iniciar sesión.');
    });
}

// ------------------------------
// CERRAR SESIÓN
// ------------------------------
function cerrarSesion() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

// ------------------------------
// CREAR TAREA
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

// ------------------------------
// MOSTRAR TAREAS Y ESTADÍSTICAS
// ------------------------------
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

      let completadas = 0;

      tareas.forEach(t => {
        if (t.completada) completadas++;

        const li = document.createElement('li');
        li.innerHTML = `
          <b>${t.titulo}</b> - ${t.descripcion} 
          [${t.completada ? '✔️' : '❌'}]
          <button onclick="completar('${t._id}')">✓</button>
          <button onclick="eliminar('${t._id}')">🗑️</button>
        `;
        lista.appendChild(li);
      });

      // Estadísticas
      const total = tareas.length;
      const pendientes = total - completadas;
      const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

      document.getElementById('total').textContent = total;
      document.getElementById('completadas').textContent = completadas;
      document.getElementById('pendientes').textContent = pendientes;
      document.getElementById('porcentaje').textContent = porcentaje + '%';
    });
}

// ------------------------------
// COMPLETAR Y ELIMINAR
// ------------------------------
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
// AUTO CARGA EN tareas.html
// ------------------------------
if (window.location.pathname.includes('tareas.html')) {
  cargarTareas();

  // Botón de cerrar sesión (opcional)
  const btnSalir = document.createElement('button');
  btnSalir.textContent = 'Cerrar sesión';
  btnSalir.onclick = cerrarSesion;
  document.body.appendChild(btnSalir);
}
