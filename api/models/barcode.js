const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

const Barcode = sequelize.define(
  'Barcode',
  {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    basicUnit: {
      type: DataTypes.STRING,
      defaultValue: 'pcs',
    },
    options: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    position: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
  },
  {},
)

module.exports = Barcode
