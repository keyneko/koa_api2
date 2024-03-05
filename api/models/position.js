const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

// Define the model for the 'positions' table
const Position = sequelize.define('Position', {
  // Unique position code with specified format
  value: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  // Name of the position
  name: {
    type: DataTypes.STRING,
  },
  // Flag indicating whether multiple items can be stacked in the same position: 0 (not allowed), 1 (allowed)
  isStackable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Status: 0 (invalid), 1 (valid)
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  isProtected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  options: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  files: {
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

// Export the 'Position' model for use in other modules
module.exports = Position
