const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  completada: { type: Boolean, default: false },
  usuario: { type: String, required: true }, // nombre de usuario que la creó
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tarea', tareaSchema);
