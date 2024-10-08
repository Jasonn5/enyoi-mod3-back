// models/Reservation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Room = require('./Room');

const Reservation = sequelize.define('Reservation', {
  guestName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  checkInDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  checkOutDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'pending',
  },
  cancelledAt: {
    type: DataTypes.DATE,
  },
});

Reservation.belongsTo(User, { foreignKey: 'userId' });
Reservation.belongsTo(Room, { foreignKey: 'roomId' });

module.exports = Reservation;
