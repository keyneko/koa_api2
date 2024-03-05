const uuid = require('uuid')
const { Op } = require('sequelize')
const Sensor = require('../models/sensor')
// const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getSensors(ctx) {
  try {
    const { name, type, number, manufacturer, status } = ctx.query
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const userId = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const whereClause = {}

    if (!isAdmin) {
      whereClause[Op.or] = [{ createdBy: userId }, { isPublic: true }]
    }

    // Fuzzy search for name (case-insensitive)
    if (name !== undefined && name !== '') {
      whereClause.name = { [Op.like]: `%${name}%` }
    }

    if (type !== undefined && type !== '') {
      whereClause.type = type
    }

    // Fuzzy search for number (case-insensitive)
    if (number !== undefined && number !== '') {
      whereClause.number = { [Op.like]: `%${number}%` }
    }

    if (manufacturer !== undefined && manufacturer !== '') {
      whereClause.manufacturer = { [Op.like]: `%${manufacturer}%` }
    }

    if (status !== undefined && status !== '') {
      whereClause.status = status
    }

    const sensors = await Sensor.findAll({
      where: whereClause,
      attributes: [
        'id',
        'name',
        'type',
        'number',
        'manufacturer',
        'apiKey',
        'status',
        'isOnline',
        'isProtected',
        'isPublic',
        'subscriptions',
        // 'translations',
      ],
    })

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: sensors.map((d) => d.dataValues),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function getSensor(ctx) {
  try {
    const { id } = ctx.query
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

    ctx.body = {
      code: 200,
      data: sensor.dataValues,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createSensor(ctx) {
  try {
    const { name, number, type, isProtected, isPublic, manufacturer } =
      ctx.request.body
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded

    // Generate a new API key using uuid
    const apiKey = uuid.v4()

    const newSensor = await Sensor.create({
      name,
      manufacturer,
      type,
      number,
      apiKey,
      isProtected,
      isPublic,
      createdBy: decoded.userId,
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

async function updateSensor(ctx) {
  try {
    const {
      id,
      name,
      number,
      manufacturer,
      type,
      status,
      isProtected,
      isPublic,
    } = ctx.request.body
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

    const updateFields = {}

    if (name !== undefined) updateFields.name = name
    if (type !== undefined) updateFields.type = type
    if (manufacturer !== undefined) updateFields.manufacturer = manufacturer
    if (number !== undefined) updateFields.number = number
    if (status !== undefined) updateFields.status = status
    if (isProtected !== undefined) updateFields.isProtected = isProtected
    if (isPublic !== undefined) updateFields.isPublic = isPublic

    await sensor.update(updateFields)

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function deleteSensor(ctx) {
  try {
    const { id } = ctx.query
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

    // Check if it is protected
    if (sensor.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedSensor',
      )
      return
    }

    await sensor.destroy()

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
  getSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor,
}
