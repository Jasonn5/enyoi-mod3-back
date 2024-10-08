// models/Room.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hotel = require('./Hotel');

const Room = sequelize.define('Room', {
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

// Definimos la relación
Room.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });

module.exports = Room;
