const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

const Dictionary = sequelize.define(
  'Dictionary',
  {
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]],
      },
    },
    isProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    translations: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    indexes: [
      { unique: true, fields: ['key', 'value'] }, // 创建复合唯一索引
    ],
    timestamps: false,
  },
)

module.exports = Dictionary
