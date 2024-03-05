const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

// Define the model for the 'sensorrecords' table
const SensorRecord = sequelize.define(
  'SensorRecord',
  {
    sensorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    timestamps: true,
  },
)

// Export the 'SensorRecord' model for use in other modules
module.exports = SensorRecord
