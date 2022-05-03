import express from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import { DidClient } from 'hyp-did'

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

  // ROUTES
  app.routes = new ExpressPromiseRouter
  app.use(app.routes)

  app.routes.get('/', async (req, res, next) => {
    const { did } = req.query
    if (did && did.startsWith('did:')) return res.redirect(`/${did}`)
    if (req.accepts('html')) return res.send(`
      <h1>DID Resolver</h1>
      <form method="get" action="/">
        <p><input type="text" name="did" style="min-width: 80vw" placeholder="did:hyp:Ekafry3EaP1tHuZI6pSSLyGBHAycke1uqZCUspScW_A" /></p>
        <p><input type="submit" value="lookup" /></p>
      </form>
    `)
    next()
  })

  app.routes.get(/^\/(did:.+)$/, async (req, res, next) => {
    const did = req.params[0]
    // res.send(`resolving did="${did}"`)

    console.log('resolving', did)
    await app.didClient.ready()
    const didDocument = await app.didClient.get(did)
    if (!didDocument){
      res.status(404)
      if (req.accepts('html')) {
        return res.send(`
          <h1>DID Not Found<h1>
          <p><input type="text" value="${did}"/></p>
        `)
      }
      if (req.accepts('json')) {
        return res.json({
          error: `unabled to resolve DID=${did}`,
        })
      }
    }
    if (!didDocument.loaded) await didDocument.update()
    if (req.accepts('html')) return res.send(`


    `)
    if (req.accepts('json')) return res.json(didDocument.value)
    next()
  })

  return app
}
