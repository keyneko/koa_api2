const Permission = require('../models/permission')
const authController = require('../controllers/authController')
// const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getPermissions(ctx) {
  try {
    const language = ctx.cookies.get('language')

    const sortOptions = [['pattern', 'ASC']]

    const permissions = await Permission.findAll({
      attributes: ['id', 'name', 'description', 'pattern', 'status', 'isProtected'],
      order: sortOptions,
    })

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: permissions.map((d) => d.dataValues),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createPermission(ctx) {
  try {
    const { name, description, pattern, isProtected } = ctx.request.body
    const language = ctx.cookies.get('language')

    const newPermission = await Permission.create({
      name,
      description,
      pattern,
      isProtected,
    })

    ctx.body = {
      code: 200,
      data: newPermission.id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updatePermission(ctx) {
  try {
    const { id, name, description, pattern, status, isProtected } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    const permission = await Permission.findByPk(id)

    if (!permission) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'permissionNotFound',
      )
      return
    }

    const updateFields = {}

    if (name != undefined) updateFields.name = name
    if (description != undefined) updateFields.description = description
    if (pattern != undefined) updateFields.pattern = pattern
    if (status != undefined) updateFields.status = status
    if (isProtected !== undefined) updateFields.isProtected = isProtected

    await permission.update(updateFields)

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

async function deletePermission(ctx) {
  try {
    const { id } = ctx.query
    const language = ctx.cookies.get('language')

    // Find the permission
    const permission = await Permission.findByPk(id)
    if (!permission) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'permissionNotFound',
      )
      return
    }

    // Check if it is protected
    if (permission.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedPermission',
      )
      return
    }

    // If not protected, delete the permission
    const result = await permission.destroy()
    if (!result) {
      return
    }

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
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
}
