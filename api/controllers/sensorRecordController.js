const { Op } = require('sequelize')
const Sensor = require('../models/sensor')
const SensorRecord = require('../models/sensorRecord')
const MessageLog = require('../models/messageLog')
const mqttController = require('../controllers/mqttController')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getRecords(ctx) {
  try {
    const {
      sensorId,
      sortBy = 'createdAt',
      sortOrder = 'asc',
      dateTime,
    } = ctx.query
    const language = ctx.cookies.get('language')

    const sensor = await Sensor.findByPk(sensorId)

    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    const query = { sensorId }

    // Convert the provided dateTime to a JavaScript Date object
    const queryDateTime = dateTime ? new Date(dateTime) : new Date()

    // Set the time to 0:00:00 for the current day
    queryDateTime.setHours(0, 0, 0, 0)

    // Calculate the end time for the current day (23:59:59)
    const endTime = new Date(queryDateTime.getTime() + 24 * 60 * 60 * 1000 - 1)

    // Add a condition to the query to filter records within the current day
    query.createdAt = {
      [Op.between]: [queryDateTime, endTime],
    }

    const records = await SensorRecord.findAll({
      where: query,
      attributes: ['id', 'createdAt', 'status'],
      order: [[sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']],
    })

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: records.map((d) => d.dataValues),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createRecord(ctx) {
  try {
    const { sensorId, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    const sensor = await Sensor.findByPk(sensorId)

    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    const newRecord = await SensorRecord.create({
      sensorId,
      status,
    })

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function publishMessage(ctx) {
  try {
    const { id, qos, retain, topic, payload } = ctx.request.body
    const language = ctx.cookies.get('language')

    const sensor = await Sensor.findByPk(id)

    if (!sensor) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'sensorNotFound',
      )
      return
    }

    // Push messages to client
    mqttController.publish(id, {
      qos,
      retain,
      topic,
      payload,
    })

    const messageLog = await MessageLog.create({
      sensorId: id,
      topic,
      payload,
      qos,
      isOnline: sensor.isOnline,
    })
    console.info(`Message log saved for client ${id}`)

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

module.exports = {
  publishMessage,
  getRecords,
  createRecord,
}
