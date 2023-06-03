const express = require('express')
const app = express()

require('express-async-errors')

//useful packages
require('dotenv').config()
const cookieParser = require('cookie-parser')

//Security packages
const cors = require('cors')
app.use(cors())

//error handlers , authentication and not found
const errorHandler = require('./Middleware/errorHandler')
const notFound = require('./Middleware/not-found')
const authenticationMiddleware = require('./Middleware/authentication')

//require API routes
const authRoutes = require('./Routes/authRoutes')
const userRoutes = require('./Routes/user')
const clientRoutes = require('./Routes/client')
const roomRoutes = require('./Routes/room')

const connect = require('./db/connect')

//port number
const port = process.env.PORT || 80

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

//API routes
app.use('/api/v1/auth', authRoutes)
// app.use('/api/v1/',authenticationMiddleware,userRoutes);
app.use('/api/v1/', userRoutes)
app.use('/api/v1/client', clientRoutes)
app.use('/api/v1/rooms', roomRoutes)

app.use(notFound)
app.use(errorHandler)

const start = async () => {
  try {
    await connect(process.env.MONGO_URI)
    app.listen(port, () => console.log(`listening on port ${port}`))
  } catch (error) {
    console.log(error)
  }
}

start()
