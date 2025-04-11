require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // <- usamos bcryptjs
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');
const Tarea = require('./models/Tarea');
const verificarToken = require('./middlewares/verificarToken');
const path = require('path');
const cors = require('cors');
app.use(cors());

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Ruta principal
app.get('/', (req, res) => {
  res.send('🌐 MiAgendaApp backend funcionando');
});

// Registro
app.post('/register', async (req, res) => {
  const { usuario, contraseña } = req.body;

  if (!usuario || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  try {
    const existe = await Usuario.findOne({ usuario });
    if (existe) {
      return res.status(409).json({ mensaje: 'El usuario ya existe' });
    }

    const hash = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new Usuario({ usuario, contraseña: hash });
    await nuevoUsuario.save();

    res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al registrar', error: err.message });
  }
});

// Login con JWT
app.post('/login', async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const encontrado = await Usuario.findOne({ usuario });
    if (!encontrado) return res.status(401).json({ mensaje: 'Usuario no encontrado' });

    const coincide = await bcrypt.compare(contraseña, encontrado.contraseña);
    if (!coincide) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ usuario }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ mensaje: 'Login exitoso', token });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: err.message });
  }
});

// Crear tarea
app.post('/tareas', verificarToken, async (req, res) => {
  const { titulo, descripcion } = req.body;
  const usuario = req.usuario;

  if (!titulo) return res.status(400).json({ mensaje: 'Falta el título' });

  try {
    const nuevaTarea = new Tarea({ titulo, descripcion, usuario });
    await nuevaTarea.save();
    res.status(201).json({ mensaje: 'Tarea creada correctamente', tarea: nuevaTarea });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al crear tarea', error: err.message });
  }
});

// Obtener tareas
app.get('/tareas', verificarToken, async (req, res) => {
  const usuario = req.usuario;

  try {
    const tareas = await Tarea.find({ usuario });
    res.json(tareas);
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al obtener tareas', error: err.message });
  }
});

// Completar tarea (toggle)
app.patch('/tareas/:id/completar', verificarToken, async (req, res) => {
  try {
    const tarea = await Tarea.findById(req.params.id);
    if (!tarea) return res.status(404).json({ mensaje: 'Tarea no encontrada' });

    tarea.completada = !tarea.completada;
    await tarea.save();

    res.json({ mensaje: 'Estado actualizado', tarea });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al actualizar tarea', error: err.message });
  }
});

// Eliminar tarea
app.delete('/tareas/:id', verificarToken, async (req, res) => {
  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ mensaje: 'Error al eliminar tarea', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
