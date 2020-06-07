require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;


const errorHandler = require('./error-handler')
const vfcRouter = require('./vfc/vfc-router')
const app = express()

const morganOption = (NODE_ENV === 'production') ? 'tiny' : 'common';
app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(
    cors({
        origin: CLIENT_ORIGIN
}))


app.use('/api/vfc',vfcRouter)

app.use(errorHandler)

module.exports = app




  