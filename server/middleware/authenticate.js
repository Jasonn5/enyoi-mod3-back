const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function authenticateUser(req, res, next) {
  const authHeader = req.header('Authorization');
  console.log('Authorization Header:', authHeader); // Asegúrate de que este log muestre el token correctamente

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado, por favor inicie sesión' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Token recibido:', token);  // Verifica que el token esté siendo capturado correctamente

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);  // Verifica que el JWT_SECRET sea correcto
    console.log('Token verificado:', verified);  // Muestra el contenido decodificado del token
    req.user = verified;
    next();
  } catch (err) {
    console.error('Error al verificar el token:', err);  // Añade un log detallado del error
    return res.status(400).json({ message: 'Token inválido' });
  }
};
