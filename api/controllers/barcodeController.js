const sequelize = require('../utils/sequelize')
const Barcode = require('../models/barcode')
// const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

// Generate barcode
async function generateBarcode(categoryCode) {
  try {
    const category = categoryCode.toUpperCase()

    // Validate the category code
    if (!/^[A-Z]{2}$/.test(category)) {
      throw new Error('Invalid category code')
    }

    // Get the current date in YYYYMMDD format
    const currentDate = new Date()
    const dateCode = `${currentDate.getFullYear()}${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${currentDate.getDate().toString().padStart(2, '0')}`

    // Use Sequelize to find the last generated barcode for the specified category and date code
    const lastBarcode = await sequelize.query(
      `
    SELECT * FROM Barcodes
    WHERE value LIKE :prefix
    ORDER BY value DESC
    LIMIT 1
  `,
      {
        replacements: {
          prefix: `${category}${dateCode}%`,
        },
        type: sequelize.QueryTypes.SELECT,
      },
    )

    // Calculate the next incremental number
    const nextIncrementalNumber =
      (lastBarcode.length > 0
        ? parseInt(lastBarcode[0].value.slice(-4), 10)
        : 0) + 1

    // Combine components to form the complete barcode value
    const barcodeValue = `${category}${dateCode}${nextIncrementalNumber
      .toString()
      .padStart(4, '0')}`

    return barcodeValue
  } catch (error) {
    // Handle any errors that may occur during the database query
    console.error(error.message)
    throw new Error('Error generating bardoe code')
  }
}

async function getBarcodes(ctx) {
  try {
    const { pageNum = 1, pageSize = 10, status } = ctx.query
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const userId = decoded.userId
    const isAdmin = (decoded.roles || []).some((role) => role.isAdmin)

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }
    if (!isAdmin) {
      filter.createdBy = userId
    }

    const offset = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const barcodes = await Barcode.findAll({
      where: filter,
      attributes: [
        'id',
        'value',
        'name',
        'quantity',
        'basicUnit',
        'status',
        'isProtected',
        'files',
        // 'translations',
      ],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: limit,
    })

    const total = await Barcode.count({
      where: filter,
    })

    // Map over the barcodes to retrieve translated values
    const mappedBarcodes = barcodes.map((barcode) => ({
      ...barcode.get({ plain: true }),
      // name: barcode.translations?.name?.[language] || barcode.name,
      // basicUnit:
      //   barcode.translations?.basicUnit?.[language] || barcode.basicUnit,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mappedBarcodes,
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function getBarcode(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')

    const barcode = await Barcode.findOne({
      where: { value },
      attributes: [
        'id',
        'value',
        'name',
        'quantity',
        'basicUnit',
        'status',
        'isProtected',
        'files',
        //'translations',
      ],
    })

    if (!barcode) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
      )
      return
    }

    ctx.body = {
      code: 200,
      data: {
        ...barcode.get({ plain: true }),
        // name: barcode.translations?.name?.[language] || barcode.name,
        // basicUnit:
        //   barcode.translations?.basicUnit?.[language] || barcode.basicUnit,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createBarcode(ctx) {
  try {
    const {
      category,
      name,
      quantity = 1,
      basicUnit,
      status,
      files,
    } = ctx.request.body
    const language = ctx.cookies.get('language')
    const decoded = ctx.state.decoded
    const value = await generateBarcode(category)

    const newBarcode = await Barcode.create({
      name,
      value,
      basicUnit,
      quantity,
      status,
      files,
      createdBy: decoded.userId,
    })

    ctx.body = {
      code: 200,
      data: {
        id: newBarcode.id,
        value,
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updateBarcode(ctx) {
  try {
    const { name, value, basicUnit, quantity, status, isProtected, files } =
      ctx.request.body
    const language = ctx.cookies.get('language')
    const barcode = await Barcode.findOne({ where: { value } })

    if (!barcode) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
      )
      return
    }

    const updateFields = {}
    if (name !== undefined) updateFields.name = name
    if (basicUnit !== undefined) updateFields.basicUnit = basicUnit
    if (quantity !== undefined) updateFields.quantity = quantity
    if (status !== undefined) updateFields.status = status
    if (isProtected !== undefined) updateFields.isProtected = isProtected
    if (files !== undefined) updateFields.files = files

    await barcode.update(updateFields)

    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function deleteBarcode(ctx) {
  try {
    const { value } = ctx.query
    const language = ctx.cookies.get('language')
    const barcode = await Barcode.findOne({ where: { value } })

    if (!barcode) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'barcodeNotFound',
      )
      return
    }

    // Check if it is protected
    if (barcode.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedBarcode',
      )
      return
    }

    await barcode.destroy()

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
  generateBarcode,
  getBarcodes,
  getBarcode,
  createBarcode,
  updateBarcode,
  deleteBarcode,
}
