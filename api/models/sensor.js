const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

// Define the model for the 'sensors' table
const Sensor = sequelize.define('Sensor', {
  name: {
    type: DataTypes.STRING,
  },
  number: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.INTEGER,
  },
  manufacturer: {
    type: DataTypes.STRING,
  },
  apiKey: {
    type: DataTypes.STRING,
    unique: true,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isProtected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  subscriptions: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  translations: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  createdBy: {
    type: DataTypes.INTEGER,
  },
})

// Export the 'Sensor' model for use in other modules
module.exports = Sensor
