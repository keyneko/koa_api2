const Koa = require('koa')
const path = require('path')
const http = require('http')
const cors = require('@koa/cors')
const { koaBody } = require('koa-body')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const sequelize = require('./utils/sequelize')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const roleRoutes = require('./routes/roleRoutes')
const permissionRoutes = require('./routes/permissionRoutes')
const dictionaryRoutes = require('./routes/dictionaryRoutes')
const fileRoutes = require('./routes/fileRoutes')
// const logRoutes = require('./routes/logRoutes')
const barcodeRoutes = require('./routes/barcodeRoutes')
const positionRoutes = require('./routes/positionRoutes')
const sensorRoutes = require('./routes/sensorRoutes')

const app = new Koa()

app.use(cors())
app.use(compress())

// Configuring static file service
app.use(koaStatic(path.join(process.cwd(), '/public')))

// Middleware
app.use(
  koaBody({
    multipart: true,
    formidable: {
      // Whether to keep the extension
      keepExtensions: true,
      // Limit upload file size
      maxFileSize: 10 * 1024 * 1024,
    },
  }),
)

// Synchronize database tables
;(async () => {
  try {
    await sequelize.sync()
  } catch (error) {
    console.error('Error syncing the Sequelize models:', error)
  }
})()

// Set routes
app.use(authRoutes.routes())
app.use(userRoutes.routes())
app.use(roleRoutes.routes())
app.use(permissionRoutes.routes())
app.use(dictionaryRoutes.routes())
app.use(fileRoutes.routes())
// app.use(logRoutes.routes())
app.use(barcodeRoutes.routes())
app.use(positionRoutes.routes())
app.use(sensorRoutes.routes())

// Start the server
const PORT = process.env.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

require('./utils/mqttServer')
