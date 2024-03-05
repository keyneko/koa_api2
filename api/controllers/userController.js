const bcrypt = require('bcrypt')
const Role = require('../models/role')
const User = require('../models/user')
const Permission = require('../models/permission')
const authController = require('../controllers/authController')
const { decryptPassword } = require('../utils/rsa')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getUsers(ctx) {
  try {
    const { sortBy = 'id', sortOrder = 'desc' } = ctx.query
    const language = ctx.cookies.get('language')

    const sortOptions = [[sortBy, sortOrder === 'desc' ? 'DESC' : 'ASC']]

    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'avatar', 'status', 'isProtected'],
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'sops'],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['pattern'],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Permission,
          as: 'denyPermissions',
          attributes: ['pattern'],
          through: { attributes: [] },
        },
      ],
      order: sortOptions,
    })

    // Add the 'token' field to each user object
    const mapped = users.map((d) => ({
      ...d.get({ plain: true }),
      roles: d.roles.map((role) => role.id),
      sops: [...new Set(d.roles.flatMap((role) => role.sops ?? []))],
      permissions: [
        ...new Set(
          d.roles.flatMap((role) =>
            role.permissions.map((permission) => permission.pattern),
          ),
        ),
      ],
      denyPermissions: [
        ...new Set(d.denyPermissions.map((permission) => permission.pattern)),
      ],
      password: undefined,
    }))

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: mapped,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function getUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
    const { id } = ctx.request.query
    const language = ctx.cookies.get('language')

    const user = await User.findByPk(id || userId, {
      attributes: ['username', 'name', 'avatar', 'status', 'isProtected'],
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'sops'],
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              as: 'permissions',
              attributes: ['pattern'],
              through: { attributes: [] },
            },
          ],
        },
        {
          model: Permission,
          as: 'denyPermissions',
          attributes: ['pattern'],
          through: { attributes: [] },
        },
      ],
    })

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    ctx.body = {
      code: 200,
      data: {
        ...user.get({ plain: true }),
        roles: user.roles.map((role) => role.id),
        sops: [...new Set(user.roles.flatMap((role) => role.sops ?? []))],
        permissions: [
          ...new Set(
            user.roles.flatMap((role) =>
              role.permissions.map((permission) => permission.pattern),
            ),
          ),
        ],
        denyPermissions: [
          ...new Set(
            user.denyPermissions.map((permission) => permission.pattern),
          ),
        ],
      },
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function createUser(ctx) {
  try {
    const { username, password, name, isProtected, roles } = ctx.request.body
    const language = ctx.cookies.get('language')

    // Check if the username already exists
    const user = await User.findOne({ where: { username } })
    if (user) {
      ctx.status = statusCodes.UserExists
      ctx.body = getErrorMessage(statusCodes.UserExists, language)
      return
    }

    // Decrypt the encrypted password
    const decryptedPassword = password
      ? decryptPassword(password)
      : process.env.UD_PASSWORD

    // Hash the password
    const hashedPassword = await bcrypt.hash(decryptedPassword, 10)

    // Create a new user
    const newUser = await User.create({
      username,
      password: hashedPassword,
      name,
      isProtected,
    })

    if (roles !== undefined) {
      const roleObjects = await Role.findAll({ where: { id: roles } })
      await newUser.setRoles(roleObjects)
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: newUser.id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updateUser(ctx) {
  try {
    const userId = ctx.state.decoded.userId
    const {
      id,
      name,
      password,
      newPassword,
      avatar,
      roles,
      denyPermissions,
      status,
      isProtected,
    } = ctx.request.body
    const language = ctx.cookies.get('language')

    const user = await User.findByPk(id || userId)
    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    const updateFields = {}

    // Check if the user exists and verify the password
    if (password) {
      // Decrypt the encrypted password
      const decryptedPassword = decryptPassword(password)

      if (await bcrypt.compare(decryptedPassword, user.password)) {
        if (newPassword) {
          // Decrypt the encrypted password
          const decryptedNewPassword = decryptPassword(newPassword)
          const hashedPassword = await bcrypt.hash(decryptedNewPassword, 10)
          updateFields.password = hashedPassword
        }
      } else {
        ctx.status = statusCodes.PasswordError
        ctx.body = getErrorMessage(
          statusCodes.PasswordError,
          language,
          'invalidOriginalPassword',
        )
        return
      }
    }

    if (name !== undefined) updateFields.name = name
    if (avatar !== undefined) updateFields.avatar = avatar
    if (status !== undefined) updateFields.status = status
    if (isProtected !== undefined) updateFields.isProtected = isProtected

    if (roles !== undefined) {
      const roleObjects = await Role.findAll({ where: { id: roles } })
      await user.setRoles(roleObjects)
    }

    if (denyPermissions !== undefined) {
      const perms = await Permission.findAll({
        where: { pattern: denyPermissions },
      })
      await user.setDenyPermissions(perms)
    }

    await user.update(updateFields)

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

async function deleteUser(ctx) {
  try {
    const { id } = ctx.query
    const language = ctx.cookies.get('language')

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'roles',
          attributes: ['isAdmin'],
          through: { attributes: [] },
        },
      ],
    })

    if (!user) {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(statusCodes.NotFound, language, 'userNotFound')
      return
    }

    // Check if it is protected
    if (user.isProtected) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'protectedUser',
      )
      return
    }

    // Check if the user being deleted has admin role
    if (user.roles.some((role) => role.isAdmin)) {
      ctx.status = statusCodes.Forbidden
      ctx.body = getErrorMessage(
        statusCodes.Forbidden,
        language,
        'cannotDeleteAdmin',
      )
      return
    }

    await user.setRoles([])
    await user.setDenyPermissions([])
    await user.destroy()

    ctx.status = 200
    ctx.body = {
      code: 200,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
}
