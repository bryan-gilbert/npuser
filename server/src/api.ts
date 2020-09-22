import {
  Router, Request, Response, ErrorRequestHandler, NextFunction, Express
} from 'express'

// @ts-ignore
import moment from 'moment'
// @ts-ignore
import cors from 'cors'
import logger from './logger'
import { IConfig } from './config/config'
import AuthController from './np-auth/auth-controller'

const authC = new AuthController()

function setupCors(config: IConfig) {
  const whitelist: string[] = [] // 'http://localhost:28000', 'http://localhost:27000']
  whitelist.push(config.clientUrl)
  whitelist.push(config.apiUrl)
  logger.info('Setup CORS with whitelist:', whitelist)

  type CorsCallback = (err: Error, options: any) => void;
  const corsOptionsDelegate = function (req: Request, callback: CorsCallback) {
    let corsOptions
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }
  return corsOptionsDelegate
}

export function apiMiddle(app: Express, config: IConfig) {
  // if (config.traceApiCalls) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    logger.info(moment().format('YYYY/MM/DD, h:mm:ss.SSS a'), req.method, ' Url:', req.url)
    next()
  })
  // }

  const corsOptions = setupCors(config)
  // const authUtil = new AuthUtil(config)
  // const admin = new AdminController(authUtil)

  const middleWare = [
    cors(corsOptions)
    // validatorMiddlewareWrapper(authUtil)
  ]
  const adminMiddleware = [
    cors(corsOptions)
    // adminLimiter,
    // validatorMiddlewareWrapper(authUtil),
    // isAdmin
  ]

  const localhostOnlyAdminMiddleware = [
    cors(corsOptions)
    // localhostOnly,
    // // adminLimiter,
    // validatorMiddlewareWrapper(authUtil),
    // isAdmin
  ]

  return Promise.resolve()
    .then(() => {
      const api = Router()
      // for local and dev only
      // api.use('/integrations', adminMiddleware, ic.route())
      api.use('/users', middleWare, authC.route())
      return api
    })
}

export function apiError(app: Express, config: IConfig) {
  // error handlers
  function logErrors(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(`EdEHR server error name: "${err.name}" message: "${err.message}" on path: ${req.path}`)
    next(err)
  }
  app.use(logErrors)
}