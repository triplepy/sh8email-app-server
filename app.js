const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('config')
const winston = require('winston')
const slackTransport = require('slack-winston').Slack

// logging
winston.level = config.logLevel
if (config.slackErrorLogging) {
  winston.add(slackTransport, {
    domain: 'sh8email',
    token: process.env.SH8_SLACK_TOKEN,
    webhook_url: process.env.SH8_SLACK_WEBHOOK_URL,
    channel: 'sh8-server-error',
    level: 'error',
  })
}
winston.handleExceptions()

// routers
const mails = require('./routes/mails')

// database setup
mongoose.connect(config.dbUri)
// Use native promises
mongoose.Promise = global.Promise

const app = express()

if (config.useMorgan) {
  app.use(morgan('dev'))
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors({ origin: config.corsOrigin }))

app.use('/api/', mails)

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  winston.error(err)

  res.status(err.status || 500)
  res.send({
    message: err.message,
  })
})

// catch 404
app.use((req, res, next) => {
  winston.info(`Not Found: ${req.originalUrl}`)
  res.sendStatus(404)
})

module.exports = app
