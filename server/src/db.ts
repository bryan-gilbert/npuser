import mongoose from 'mongoose'
import { IConfig } from './config/config'

const debug = require('debug')('server')
const logError = require('debug')('error')

export const db = function (config: IConfig) {
  return new Promise((resolve, reject) => {
    const dbc = config.database
    const sanitizedConfig = Object.assign( {} , dbc)
    // sanitizedConfig.password = 'aPassword'
    debug('DB Configuration: %s', JSON.stringify(sanitizedConfig,null,2))

    let auth = false
    let uri = []
    // https://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html
    // mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
    uri.push('mongodb://')
    if (dbc.user && dbc.password) {
      auth = true
      uri.push(dbc.user)
      uri.push(':')
      uri.push(dbc.password)
      uri.push('@')
    }

    uri.push(dbc.host)
    uri.push(':')
    uri.push(dbc.port)
    uri.push('/')
    uri.push(dbc.name)
    // https://stackoverflow.com/questions/40608669/what-does-authsource-means-in-mongo-database-url/55779444#55779444
    if (auth) uri.push('?authSource=admin')
    let uriComposed = uri.join('')
    const sanitized = auth ? uriComposed.replace(dbc.password, 'aPassword') : uriComposed
    debug('DB URN sanitized: ====  %s', sanitized)
    debug('DB Options: %o', dbc.options)
    mongoose
      .connect(uriComposed, dbc.options)
      .then(conn => {
        debug('MongoDB Connected to ' + sanitized)
        resolve(conn)
      })
      .catch(error => {
        logError(`db connect error:  ${error}`)
        reject(error)
      })
  })
}
