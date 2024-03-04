const Koa = require('koa')
const path = require('path')
const http = require('http')
const { koaBody } = require('koa-body')
const koaStatic = require('koa-static')
const sequelize = require('./utils/sequelize')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const roleRoutes = require('./routes/roleRoutes')
const permissionRoutes = require('./routes/permissionRoutes')
const dictionaryRoutes = require('./routes/dictionaryRoutes')
const fileRoutes = require('./routes/fileRoutes')

const app = new Koa()

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
sequelize.sync()

// Set routes
app.use(authRoutes.routes())
app.use(userRoutes.routes())
app.use(roleRoutes.routes())
app.use(permissionRoutes.routes())
app.use(dictionaryRoutes.routes())
app.use(fileRoutes.routes())

// Start the server
const PORT = process.env.PORT || 4000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
