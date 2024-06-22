import pino from 'pino'
import path from 'path'

const targets = []

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  targets.push({
    target: 'pino-pretty'
  })
}

if (process.env.PINO_LOG_TO_CONSOLE) {
  targets.push(pino.destination(1))
}

if (process.env.PINO_LOG_TO_FILE) {
  const logFile = path.resolve('./logs/log.log')
  targets.push(pino.destination(logFile))
}

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || 'info',
    timestamp: pino.stdTimeFunctions.isoTime
  },
  pino.transport({
    targets
  })
)
export default logger
