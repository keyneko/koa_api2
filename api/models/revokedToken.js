const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')

const RevokedToken = sequelize.define(
  'RevokedToken',
  {
    token: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    paranoid: true, // Enable soft deletion
    timestamps: true, // Enable the createdAt and updatedAt fields
    hooks: {
      beforeCreate: (revokedToken, options) => {
        const date = new Date()
        date.setDate(date.getDate() + 7)
        revokedToken.expiresAt = date
      },
    },
  },
)

module.exports = RevokedToken
