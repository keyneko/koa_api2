// sequelize.js
const dotenv = require('dotenv')
const { Sequelize } = require('sequelize')

// Load environment variables from the appropriate file based on the NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false,
})

module.exports = sequelize
