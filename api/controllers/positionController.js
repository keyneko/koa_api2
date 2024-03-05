const sequelize = require('../utils/sequelize')
const Position = require('../models/position')
// const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

// Function to generate a position code
async function generatePosition(areaCode, buildingCode, floorCode) {
  try {
    // Format the components
    const formattedAreaCode = areaCode.toString().padStart(4, '0')
    const formattedBuildingCode = buildingCode.toString().padStart(2, '0')
    const formattedFloorCode = floorCode.toString().padStart(2, '0')

    // Use Sequelize to execute a raw SQL query to find the last generated position code
    const [lastPosition] = await sequelize.query(
      `
      SELECT value
      FROM positions
      WHERE value LIKE 'KW${formattedAreaCode}${formattedBuildingCode}${formattedFloorCode}%'
      ORDER BY value DESC
      LIMIT 1
    `,
      { type: sequelize.QueryTypes.SELECT },
    )

    // Extract the last incremental number or set it to 0 if no previous positions exist
    const lastIncrementalNumber = lastPosition
      ? parseInt(lastPosition.value.substr(-4), 10)
      : 0

    // Calculate the next incremental number
    const formattedIncrementalNumber = (lastIncrementalNumber + 1)
      .toString()
      .padStart(4, '0')

    // Combine components to form the position code
    const positionCode = `KW${formattedAreaCode}${formattedBuildingCode}${formattedFloorCode}${formattedIncrementalNumber}`

    return positionCode
  } catch (error) {
    // Handle any errors that may occur during the database query
    console.error(error.message)
    throw new Error('Error generating position code')
  }
}

async function getPositions(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, status, isStackable } = ctx.query
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const userId = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }
    if (isStackable !== undefined && isStackable !== '') {
      filter.isStackable = isStackable
    }
    if (!isAdmin) {
      filter.createdBy = userId
    }

    const offset = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const positions = await Position.findAll({
      where: filter,
      attributes: [
        'id',
        'value',
        'name',
        'isStackable',
        'status',
        'isProtected',
        'files',
        // 'translations',
      ],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: limit,
    })

    const total = await Position.count({
      where: filter,
    })

    // Map over the positions to retrieve translated values
    const mappedPositions = positions.map((position) => ({
      ...position.get({ plain: true }),
      // name: position.translations?.name?.[language] || position.name,
      translations: undefined,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedPositions,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function getPosition(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const position = await Position.findOne({
      where: { value },
      attributes: [
        'id',
        'value',
        'name',
        'isStackable',
        'status',
        'isProtected',
        'files',
        // 'translations',
      ],
    })

    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }
    ctx.body = {
      code: 200,
      data: {
        ...position.get({ plain: true }),
        // name: position.translations?.name?.[language] || position.name,
        translations: undefined,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createPosition(ctx) {
  try {
    const {
      areaCode,
      buildingCode,
      floorCode,
      name,
      status,
      isStackable,
      files,
    } = ctx.request.body
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const value = await generatePosition(areaCode, buildingCode, floorCode)

    const newPosition = await Position.create({
      name,
      value,
      status,
      isStackable,
      files,
      createdBy: decoded.userId,
    })

    ctx.body = {
      code: 200,
      data: {
        id: newPosition.id,
        value,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updatePosition(ctx) {
  try {
    const { name, value, status, isStackable, isProtected, files } = ctx.request.body
    const language = ctx.cookies.get('language')
    const position = await Position.findOne({ where: { value } })

    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }

    const updateFields = {}
    if (name !== undefined) updateFields.name = name
    if (status !== undefined) updateFields.status = status
    if (isStackable !== undefined) updateFields.isStackable = isStackable
    if (isProtected !== undefined) updateFields.isProtected = isProtected
    if (files !== undefined) updateFields.files = files

    await position.update(updateFields)

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function deletePosition(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')
    const position = await Position.findOne({ where: { value } })

    if (!position) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'positionNotFound',
      )
      return
    }

    // Check if it is protected
    if (position.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedPosition',
      )
      return
    }

    await position.destroy()

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
  generatePosition,
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
}
