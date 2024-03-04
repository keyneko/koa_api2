const { Op } = require('sequelize')
const Dictionary = require('../models/dictionary')
// const { logger } = require('../utils/logger')
const { getErrorMessage, statusCodes } = require('../utils/statusCodes')

async function getDictionaries(ctx) {
  try {
    const { key, status, pageNum = 1, pageSize = 10 } = ctx.query
    const language = ctx.cookies.get('language')

    const filter = {}
    if (status !== undefined && status !== '') {
      filter.status = status
    }

    // Fuzzy search for name (case-insensitive)
    if (key !== undefined && key !== '') {
      filter.key = { [Op.like]: `%${key}%` }
    }

    const offset = (pageNum - 1) * pageSize
    const limit = parseInt(pageSize)

    const dictionaries = await Dictionary.findAll({
      attributes: ['id', 'key', 'value', 'name', 'status', 'isProtected'],
      where: filter,
      order: [
        ['key', 'ASC'],
        ['value', 'ASC'],
      ],
      offset,
      limit,
    })

    const total = await Dictionary.count({ where: filter })

    ctx.body = {
      code: 200,
      data: dictionaries.map((d) => d.dataValues),
      total,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function getDictionary(ctx) {
  try {
    const language = ctx.cookies.get('language')
    const { key } = ctx.query

    const dictionaries = await Dictionary.findAll({
      where: { key },
      attributes: ['value', 'name'],
    })

    ctx.status = 200
    ctx.body = {
      code: 200,
      data: dictionaries.map((d) => d.dataValues),
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function createDictionary(ctx) {
  try {
    const { key, value, name, isProtected } = ctx.request.body
    const language = ctx.cookies.get('language')

    const dictionary = await Dictionary.create({
      key,
      value,
      name,
      isProtected,
    })

    ctx.body = {
      code: 200,
      data: dictionary._id,
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

async function updateDictionary(ctx) {
  try {
    const { id, value, name, isProtected, status } = ctx.request.body
    const language = ctx.cookies.get('language')

    const dictionary = await Dictionary.findOne({ where: { id } })
    if (dictionary) {
      const updateFields = {}
      if (name !== undefined) updateFields.name = name
      if (value !== undefined) updateFields.value = value
      if (status !== undefined) updateFields.status = status
      if (isProtected !== undefined) updateFields.isProtected = isProtected
      await dictionary.update(updateFields)
    } else {
      ctx.status = statusCodes.NotFound
      ctx.body = getErrorMessage(
        statusCodes.NotFound,
        language,
        'dictionaryNotFound',
      )
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

async function deleteDictionary(ctx) {
  try {
    const { id, key } = ctx.query
    const language = ctx.cookies.get('language')

    // Delete dictionary by id
    if (id) {
      const dictionary = await Dictionary.findOne({ where: { id } })

      if (!dictionary) {
        ctx.status = statusCodes.NotFound
        ctx.body = getErrorMessage(
          statusCodes.NotFound,
          language,
          'dictionaryNotFound',
        )
        return
      }

      // Check if it is protected
      if (dictionary.isProtected) {
        ctx.status = statusCodes.Forbidden
        ctx.body = getErrorMessage(
          statusCodes.Forbidden,
          language,
          'protectedDictionary',
        )
        return
      }

      // If not protected, delete the dictionary
      await dictionary.destroy()

      ctx.body = {
        code: 200,
      }
    }

    // Delete dictionaries by key
    else if (key) {
      const dictionaries = await Dictionary.findAll({
        where: { key },
      })
      if (!dictionaries.length) {
        ctx.status = statusCodes.NotFound
        ctx.body = getErrorMessage(
          statusCodes.NotFound,
          language,
          'dictionaryNotFound',
        )
        return
      }

      // Filter out protected records
      const unprotectedDictionaries = dictionaries.filter((d) => !d.isProtected)
      const deletionPromises = unprotectedDictionaries.map((d) => d.destroy())
      const results = await Promise.all(deletionPromises)

      ctx.body = {
        code: 200,
        data: results.map((d) => d.id),
      }
    }
  } catch (error) {
    ctx.status = statusCodes.InternalServerError
    ctx.body = error.message
    console.error(error.message)
  }
}

module.exports = {
  getDictionaries,
  getDictionary,
  createDictionary,
  updateDictionary,
  deleteDictionary,
}
