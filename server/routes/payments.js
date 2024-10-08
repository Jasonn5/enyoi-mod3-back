// routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');
const authenticateUser = require('../middleware/authenticate');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Rutas para gestionar los pagos
 */

/**
 * @swagger
 * /api/payments/create-payment:
 *   post:
 *     summary: Procesar un pago con Stripe
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 150.00
 *               currency:
 *                 type: string
 *                 example: "usd"
 *               source:
 *                 type: string
 *                 example: "tok_visa"
 *               reservationId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pago procesado exitosamente
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error al procesar el pago
 */
router.post('/create-payment', authenticateUser, async (req, res) => {
  const { amount, currency, source, reservationId } = req.body;

  try {
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) return res.status(404).json({ message: 'Reserva no encontrada' });

    // Crear el cargo en Stripe
    const payment = await stripe.charges.create({
      amount: Math.round(amount * 100), // Stripe trabaja con centavos
      currency,
      source,
      description: `Pago para la reserva ${reservationId}`,
    });

    // Registrar el pago en la base de datos
    const newPayment = await Payment.create({
      reservationId,
      amount,
      paymentMethod: 'stripe',
      status: 'completed',
      paymentDate: new Date(),
    });

    res.status(201).json(newPayment);
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar el pago' });
  }
});

module.exports = router;
