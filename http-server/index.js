import Path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import hbs from 'express-hbs'
import bodyParser from 'body-parser'
import { DidClient } from 'jlinx'
import { isValidDID } from 'jlinx/util.js'

const __dirname = Path.resolve(fileURLToPath(import.meta.url), '..')

export default function createHypDidHttpServer(opts){
  const {
    port,
    storagePath,
  } = opts

  const app = express()

  app.start = async function start(){
    app.didClient = new DidClient({
      storagePath,
    })

    const start = () =>
      new Promise((resolve, reject) => {
        console.log('starting express server')
        app.server = app.listen(port, error => {
          if (error) return reject(error)
          console.log(`started at http://localhost:${port}`)
          resolve();
        })
      })

    await Promise.all([
      app.didClient.connect(),
      start(),
    ])
  }

  app.stop = async function stop() {
    if (app.didClient) promises.push(app.didClient.destroy())
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

    if (req.accepts('html')) return res.render('index', {
      hyperswarmStatus: JSON.stringify(await app.didClient.status(), null, 2),
    })
    next()
  })

  app.routes.get(/^\/(did:.+)$/, async (req, res, next) => {
    const did = req.params[0]
    if (!isValidDID(did)) return renderError(req, res, `invalid did DID=${did}`, 400)
    console.log('resolving', did)
    await app.didClient.ready()
    const didDocument = await app.didClient.get(did)
    if (!didDocument) return renderError(req, res, `unable to resolve DID=${did}`, 404)
    console.log('updating', did)
    if (!didDocument.loaded) await didDocument.update()
    console.log('resolved', didDocument.value)
    if (req.accepts('html'))
      return res.render('did', {
        did, json: JSON.stringify(didDocument.value, null, 2)
      })
    return res.json(didDocument.value)
  })

  return app
}
