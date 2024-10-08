// routes/reservations.js
const express = require('express');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const authenticateUser = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Rutas para gestionar las reservas
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Crear una nueva reserva
 *     tags: [Reservas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestName:
 *                 type: string
 *                 example: Juan Pérez
 *               phone:
 *                 type: string
 *                 example: "123456789"
 *               checkInDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-10-10
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *                 example: 2023-10-15
 *               roomId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *       400:
 *         description: Error al crear la reserva o fechas no disponibles
 */
router.post('/', authenticateUser, async (req, res) => {
  const { guestName, phone, checkInDate, checkOutDate, roomId } = req.body;

  try {
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });

    // Verificar disponibilidad
    const overlappingReservations = await Reservation.findOne({
      where: {
        roomId,
        [Op.or]: [
          { checkInDate: { [Op.between]: [checkInDate, checkOutDate] } },
          { checkOutDate: { [Op.between]: [checkInDate, checkOutDate] } },
        ]
      }
    });

    if (overlappingReservations) {
      return res.status(400).json({ message: 'La habitación no está disponible en las fechas seleccionadas' });
    }

    const reservation = await Reservation.create({
      guestName,
      phone,
      checkInDate,
      checkOutDate,
      roomId,
      userId: req.user.id
    });

    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: 'No se pudo crear la reserva' });
  }
});

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Obtener todas las reservas del usuario autenticado
 *     tags: [Reservas]
 *     responses:
 *       200:
 *         description: Lista de reservas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const reservations = await Reservation.findAll({ where: { userId: req.user.id } });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   put:
 *     summary: Cancelar una reserva
 *     tags: [Reservas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la reserva a cancelar
 *     responses:
 *       200:
 *         description: Reserva cancelada exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       403:
 *         description: No es posible cancelar esta reserva
 */
router.put('/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'La reserva ya ha sido cancelada' });
    }

    // Cancelar la reserva
    reservation.status = 'cancelled';
    reservation.cancelledAt = new Date();
    await reservation.save();

    res.status(200).json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al cancelar la reserva' });
  }
});

module.exports = router;
