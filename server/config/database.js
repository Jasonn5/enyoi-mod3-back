const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Evitar logs innecesarios
});

sequelize.authenticate()
  .then(() => console.log('Conectado a MySQL'))
  .catch((err) => console.error('No se pudo conectar a MySQL:', err));

module.exports = sequelize;
