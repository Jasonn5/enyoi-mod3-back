// routes/hotels.js
const express = require('express');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room'); 
const authenticateUser = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Hoteles
 *   description: Rutas para gestión de hoteles
 */

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Obtener todos los hoteles
 *     tags: [Hoteles]
 *     responses:
 *       200:
 *         description: Lista de hoteles obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hotel'
 */
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.findAll();
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener hoteles' });
  }
});

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: Obtener todos los hoteles con posibilidad de filtrado
 *     tags: [Hoteles]
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación (dirección)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo por noche
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo por noche
 *       - in: query
 *         name: rating
 *         schema:
 *           type: number
 *         description: Filtrar por calificación mínima
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Filtrar por comodidades (WiFi, Piscina, etc.)
 *     responses:
 *       200:
 *         description: Lista de hoteles obtenida con éxito
 *       500:
 *         description: Error al obtener los hoteles
 */
router.get('/', async (req, res) => {
  const { address, minPrice, maxPrice, rating, amenities } = req.query;

  const where = {};

  if (address) {
    where.address = { [Op.like]: `%${address}%` };  // Filtra por dirección
  }

  if (minPrice) {
    where.pricePerNight = { ...where.pricePerNight, [Op.gte]: parseFloat(minPrice) };  // Precio mínimo
  }

  if (maxPrice) {
    where.pricePerNight = { ...where.pricePerNight, [Op.lte]: parseFloat(maxPrice) };  // Precio máximo
  }

  if (rating) {
    where.rating = { [Op.gte]: parseFloat(rating) };  // Calificación mínima
  }

  if (amenities) {
    where.amenities = { [Op.like]: `%${amenities}%` };  // Filtra por comodidades (WiFi, Piscina, etc.)
  }

  try {
    const hotels = await Hotel.findAll({ where });
    res.json(hotels);
  } catch (error) {
    console.error('Error al obtener hoteles:', error);
    res.status(500).json({ message: 'Error al obtener hoteles' });
  }
});

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: Obtener un hotel por su ID con todas sus habitaciones
 *     tags: [Hoteles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *     responses:
 *       200:
 *         description: Detalles del hotel y sus habitaciones obtenidos con éxito
 *       404:
 *         description: Hotel no encontrado
 *       500:
 *         description: Error al obtener el hotel
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findByPk(id, {
      include: [{
        model: Room,
        required: false  // Asegura que se incluya el modelo Room aunque no haya habitaciones
      }]
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel no encontrado' });
    }

    // Si no hay habitaciones, se devuelve un array vacío
    if (!hotel.Rooms || hotel.Rooms.length === 0) {
      hotel.Rooms = [];
    }

    res.json(hotel);
  } catch (error) {
    console.error('Error al obtener el hotel:', error);
    res.status(500).json({ message: 'Error al obtener el hotel' });
  }
});



/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: Agregar un nuevo hotel (solo administradores)
 *     tags: [Hoteles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hotel ABC
 *               address:
 *                 type: string
 *                 example: Calle 123
 *               pricePerNight:
 *                 type: number
 *                 example: 150.00
 *               rating:
 *                 type: number
 *                 example: 4.5
 *               amenities:
 *                 type: string
 *                 example: "WiFi, Piscina"
 *               cancellationPolicy:
 *                 type: string
 *                 example: "Cancelación sin cargo hasta 24 horas antes"
 *     responses:
 *       201:
 *         description: Hotel creado exitosamente
 *       403:
 *         description: Acceso denegado (no es administrador)
 *       400:
 *         description: Error al crear el hotel
 */
router.post('/', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { name, address, pricePerNight, imageUrl, rating, amenities, cancellationPolicy } = req.body;
  
  try {
    const hotel = await Hotel.create({ name, address, imageUrl,pricePerNight, rating, amenities, cancellationPolicy });
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear el hotel' });
  }
});


// Añadir una nueva habitación a un hotel (solo administradores)
router.post('/:hotelId/rooms', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { hotelId } = req.params;
  const { roomNumber, capacity, pricePerNight, availability } = req.body;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel no encontrado' });
    }

    const newRoom = await Room.create({
      hotelId,
      roomNumber,
      capacity,
      pricePerNight,
      availability
    });

    res.status(201).json({ message: 'Habitación añadida exitosamente', room: newRoom });
  } catch (error) {
    console.error('Error al añadir la habitación:', error);
    res.status(500).json({ message: 'Error al añadir la habitación' });
  }
});

/**
 * @swagger
 * /api/hotels/{hotelId}/rooms/{roomId}:
 *   put:
 *     summary: Editar una habitación (solo administradores)
 *     tags: [Hoteles]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habitación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *                 example: 101
 *               capacity:
 *                 type: integer
 *                 example: 2
 *               pricePerNight:
 *                 type: number
 *                 example: 150.00
 *               availability:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Habitación actualizada con éxito
 *       403:
 *         description: Acceso denegado (solo administradores)
 *       404:
 *         description: Hotel o habitación no encontrados
 */
router.put('/:hotelId/rooms/:roomId', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { hotelId, roomId } = req.params;
  const { roomNumber, capacity, pricePerNight, availability } = req.body;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel no encontrado' });

    const room = await Room.findOne({ where: { id: roomId, hotelId } });
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });

    await room.update({ roomNumber, capacity, pricePerNight, availability });
    res.json({ message: 'Habitación actualizada con éxito', room });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la habitación' });
  }
});

/**
 * @swagger
 * /api/hotels/{hotelId}/rooms/{roomId}:
 *   delete:
 *     summary: Eliminar una habitación (solo administradores)
 *     tags: [Hoteles]
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del hotel
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habitación
 *     responses:
 *       200:
 *         description: Habitación eliminada exitosamente
 *       403:
 *         description: Acceso denegado (solo administradores)
 *       404:
 *         description: Hotel o habitación no encontrados
 */
router.delete('/:hotelId/rooms/:roomId', authenticateUser, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }

  const { hotelId, roomId } = req.params;

  try {
    const hotel = await Hotel.findByPk(hotelId);
    if (!hotel) return res.status(404).json({ message: 'Hotel no encontrado' });

    const room = await Room.findOne({ where: { id: roomId, hotelId } });
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });

    await room.destroy();
    res.json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la habitación' });
  }
});

module.exports = router;

