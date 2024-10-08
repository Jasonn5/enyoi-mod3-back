// models/Hotel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Hotel = sequelize.define('Hotel', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pricePerNight: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  rating: {
    type: DataTypes.FLOAT,
  },
  amenities: {
    type: DataTypes.TEXT,
  },
  cancellationPolicy: {
    type: DataTypes.TEXT,
  },
});

Hotel.hasMany(Room, { foreignKey: 'hotelId', as: 'rooms' });

module.exports = Hotel;
