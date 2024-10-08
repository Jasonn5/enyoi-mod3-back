// models/Payment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Reservation = require('./Reservation');

const Payment = sequelize.define('Payment', {
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  refundStatus: {
    type: DataTypes.ENUM('pending', 'processed', 'failed'),
    defaultValue: 'pending',
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

Payment.belongsTo(Reservation, { foreignKey: 'reservationId' });

module.exports = Payment;
