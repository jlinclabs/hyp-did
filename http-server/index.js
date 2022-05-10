import Path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import hbs from 'express-hbs'
import bodyParser from 'body-parser'

import { isJlinxDid } from 'jlinx-core/util.js'
import KeyStore from 'jlinx-core/KeyStore.js'
import DidStore from 'jlinx-core/DidStore.js'
import JlinxAgent from 'jlinx-server/JlinxAgent.js'

const __dirname = Path.resolve(fileURLToPath(import.meta.url), '..')

export default function createHypDidHttpServer(opts){
  for (const prop of 'port storagePath agentPublicKey'.split(' '))
    if (!opts[prop]) throw new Error(`jlinx-http-server requires ${prop}`)
  const app = express()
  app.port = opts.port
  app.start = async function start(){
    app.storagePath = opts.storagePath
    app.keys = new KeyStore(Path.join(app.storagePath, 'keys'))
    app.dids = new DidStore(Path.join(app.storagePath, 'dids'))
    app.agent = new JlinxAgent({
      publicKey: opts.agentPublicKey,
      storagePath: app.storagePath,
      keys: app.keys,
      dids: app.dids,
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
      app.agent.ready(),
      start(),
    ])
  }

  app.stop = async function stop() {
    if (app.agent) promises.push(app.agent.destroy())
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
    console.log('resolving', did)
    await app.agent.ready()
    const didDocument = await app.agent.resolveDid(did)
    if (!didDocument) return renderError(req, res, `unable to resolve DID=${did}`, 404)
    // console.log('updating', did)
    // if (!didDocument.loaded) await didDocument.update()
    // console.log('resolved', didDocument.value)
    if (req.accepts('html'))
      return res.render('did', {
        did, json: JSON.stringify(didDocument, null, 2)
      })
    return res.json(didDocument)
  })

  return app
}
