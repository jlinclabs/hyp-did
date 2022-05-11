import Debug from 'debug'
import Path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import hbs from 'express-hbs'
import bodyParser from 'body-parser'

import { isJlinxDid } from 'jlinx-core/util.js'
import JlinxApp from 'jlinx-app'
// import KeyStore from 'jlinx-core/KeyStore.js'

const debug = Debug('jlinx:http-server')

// import DidStore from 'jlinx-core/DidStore.js'
// import JlinxAgent from 'jlinx-server/JlinxAgent.js'

const __dirname = Path.resolve(fileURLToPath(import.meta.url), '..')

export default function createHypDidHttpServer(opts){
  debug(opts)
  const app = express()
  app.port = opts.port
  app.start = async function start(){
    debug('starting')
    app.jlinx = new JlinxApp({
      storagePath: opts.jlinxStoragePath,
    })

    const start = () =>
      new Promise((resolve, reject) => {
        console.log('starting express server')
        app.server = app.listen(app.port, error => {
          if (error) return reject(error)
          console.log(`started at http://localhost:${app.port}`)
          resolve();
        })
      })

    await Promise.all([
      app.jlinx.connected(),
      start(),
    ])
  }

  app.stop = async function stop() {
    if (app.jlinx) promises.push(app.jlinx.destroy())
    if (app.server) promises.push(app.server.stop())
    await Promise.all(promises)
  }


  app.use(express.static(__dirname + '/public'));
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json({ }))

  // RENDER HTML
  app.engine('hbs', hbs.express4({
    // partialsDir: __dirname + `${views}/partials`,
    defaultLayout: __dirname + `/views/layout.hbs`,
  }))
  app.set('view engine', 'hbs')
  app.set('views', __dirname + '/views')

  function renderError(req, res, error, statusCode = 401){
    console.error(error)
    res.status(statusCode)
    if (req.accepts('html')) return res.render('error', { error })
    // if (req.accepts('json'))
    else return res.json({ error })
  }

  // ROUTES
  app.routes = new ExpressPromiseRouter
  app.use(app.routes)

  app.routes.get('/', async (req, res, next) => {
    const { did } = req.query
    if (did && did.startsWith('did:')) return res.redirect(`/${did}`)

    if (req.accepts('html')) return res.render('index')
    next()
  })

  app.routes.get(/^\/(did:.+)$/, async (req, res, next) => {
    const did = req.params[0]
    if (!isJlinxDid(did)) return renderError(req, res, `invalid did DID=${did}`, 400)
    const didDocument = await app.jlinx.resolveDid(did)
    if (!didDocument) return renderError(req, res, `unable to resolve DID=${did}`, 404)
    if (req.accepts('html'))
      return res.render('did', {
        did, json: JSON.stringify(didDocument, null, 2)
      })
    return res.json(didDocument)
  })

  app.routes.get('/status', async (req, res, next) => {
    const status = await app.jlinx.agent.hypercore.status()
    res.json({
      hypercore: status,
    })
  })

  return app
}
