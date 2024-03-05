const Router = require('koa-router')
const sensorRouter = new Router()
const authController = require('../controllers/authController')
const sensorController = require('../controllers/sensorController')
const sensorRecordController = require('../controllers/sensorRecordController')

// Get all sensors
sensorRouter.get(
  '/sensors',
  authController.hasToken,
  sensorController.getSensors,
)

// Get sensor
sensorRouter.get(
  '/sensor',
  authController.hasToken,
  sensorController.getSensor,
)

// Create a sensor
sensorRouter.post(
  '/sensor',
  authController.hasToken,
  sensorController.createSensor,
)

// Update a sensor
sensorRouter.put(
  '/sensor',
  authController.hasToken,
  sensorController.updateSensor,
)

// Delete a sensor
sensorRouter.delete(
  '/sensor',
  authController.isAdmin,
  sensorController.deleteSensor,
)

// Publish a message to clinet
sensorRouter.post(
  '/sensor/publish',
  authController.hasToken,
  sensorRecordController.publishMessage,
)

// Get all records
sensorRouter.get(
  '/sensor/records',
  authController.hasToken,
  sensorRecordController.getRecords,
)

// Create a record
sensorRouter.post(
  '/sensor/record',
  authController.hasApiKey,
  sensorRecordController.createRecord,
)

module.exports = sensorRouter
