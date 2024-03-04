const Role = require('../models/role')
const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getRoles(ctx) {
  try {
    const { sortBy = 'id', sortOrder = 'ASC' } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = [[sortBy, sortOrder.toUpperCase()]]

    const roles = await Role.findAll({
      attributes: [
        'id',
        'name',
        'status',
        'isProtected',
        'sops',
        'translations',
      ],
      include: [
        {
          model: Permission,
          as: 'permissions',
          attributes: ['pattern'],
          through: { attributes: [] },
        },
      ],
      order: sortOptions,
    })

    const mapped = roles.map((d) => ({
      ...d.get({ plain: true }),
      permissions: d.permissions.map((p) => p.pattern),
      translations: undefined,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mapped,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createRole(ctx) {
  try {
    const { name, isProtected, sops, permissions /* patterns */ } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    const newRole = await Role.create({
      name,
      sops,
      isProtected,
    })

    if (permissions !== undefined) {
      const perms = await Permission.findAll({
        where: { pattern: permissions },
      })
      await newRole.addPermissions(perms)
    }

    ctx.body = {
      code: 200,
      data: newRole.id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updateRole(ctx) {
  try {
    const { id, name, status, isProtected, sops, permissions } =
      ctx.request.body
    const language = ctx.cookies.get('language')

    const role = await Role.findByPk(id)
    if (!role) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
      return
    }

    const updateFields = {}
    if (name !== undefined) updateFields.name = name
    if (status !== undefined) updateFields.status = status
    if (isProtected !== undefined) updateFields.isProtected = isProtected
    if (sops !== undefined) updateFields.sops = sops

    if (permissions !== undefined) {
      const perms = await Permission.findAll({
        where: { pattern: permissions },
      })
      await role.setPermissions(perms)
    }

    await role.update(updateFields)

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

async function deleteRole(ctx) {
  try {
    const { id } = ctx.query
    const language = ctx.cookies.get('language')

    const role = await Role.findByPk(id)
    if (!role) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
      return
    }

    // Check if the role being deleted is admin
    if (role.isAdmin) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    // Check if it is protected
    if (role.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedRole',
      )
      return
    }

    await role.setPermissions([])

    const result = await role.destroy()
    if (!result) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'roleNotFound')
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
  getRoles,
  createRole,
  updateRole,
  deleteRole,
}
