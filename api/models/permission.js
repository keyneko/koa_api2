const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

const Permission = sequelize.define(
  'Permission',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    pattern: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]],
      },
    },
    translations: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {},
)

module.exports = Permission
