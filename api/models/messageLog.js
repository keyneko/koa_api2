const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

// Define the model for the 'messageLogs' table
const MessageLog = sequelize.define(
  'MessageLog',
  {
    sensorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    qos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    timestamps: true,
  },
)

// Export the 'MessageLog' model for use in other modules
module.exports = MessageLog
