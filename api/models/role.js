// models/role.js

const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')
const Permission = require('./permission')

const Role = sequelize.define(
  'Role',
  {
    name: {
      type: DataTypes.STRING,
    },
    isProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        isIn: [[0, 1]],
      },
    },
    sops: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    translations: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    // Define associations or other configurations here
  },
)

// Assuming you have Permission model defined as well
// For associations, you might do something like this:
Role.belongsToMany(Permission, {
  through: 'RolePermissions',
  as: 'permissions',
  defaultValue: [],
})

module.exports = Role
