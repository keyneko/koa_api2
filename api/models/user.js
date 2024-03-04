// models/user.js

const { DataTypes } = require('sequelize')
const sequelize = require('../utils/sequelize')
const Role = require('./role')
const Permission = require('./permission')

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    isProtected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  {
    // Define associations or other configurations here
  },
)

// Assuming you have Role and Permission models defined as well
// For associations, you might do something like this:
User.belongsToMany(Role, {
  through: 'UserRoles',
  as: 'roles',
  defaultValue: [],
})

User.belongsToMany(Permission, {
  through: 'UserDenyPermissions',
  as: 'denyPermissions',
  defaultValue: [],
})

module.exports = User
