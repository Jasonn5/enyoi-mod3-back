// server.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const createAdminUser = require('./seeders/createAdminUser'); 
require('dotenv').config();

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

// Importar rutas
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const reservationRoutes = require('./routes/reservations');
const paymentRoutes = require('./routes/payments');

const app = express();
app.use(cors());
app.use(express.json());

// Definir las opciones de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: "API de Tu Hotel",
      version: "1.0.0",
      description: "Documentación de la API para la aplicación de reservas de hotel",
      contact: {
        name: "Soporte",
      },
      servers: [{ url: "http://localhost:5000" }],
    },
  },
  apis: ['./routes/*.js'],  // Apuntamos a los archivos donde están definidas las rutas
};

// Generar la especificación de Swagger
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Rutas para Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Conectar a la base de datos y arrancar el servidor
sequelize.sync({ force: false }).then(async ()=> {
  console.log('Conectado a la base de datos y tablas sincronizadas');
  await createAdminUser(); 
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
});
