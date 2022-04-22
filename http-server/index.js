import express from 'express'
import ExpressPromiseRouter from 'express-promise-router'
import { DidClient } from 'hyp-did'

export default function createHypDidHttpServer(opts){
  const {
    port,
    storagePath,
  } = opts

  let didClient

  const app = express()

  app.start = async function start(){
    didClient = new DidClient({
      storagePath,
    })
    await Promise.all([
      didClient.connect(),
      new Promise((resolve, reject) => {
        console.log('starting express server')
        app.server = app.listen(port, error => {
          if (error) reject(error); else resolve();
        })
      }),
    ])
  }

  app.stop = async function stop() {
    if (didClient) promises.push(didClient.destroy())
    if (app.server) promises.push(app.server.stop())
    await Promise.all(promises)
  }

  // ROUTES
  const router = new ExpressPromiseRouter
  app.use(router)

  router.get('/', async (req, res, next) => {
    res.send('hello world')
  })

  router.get(/^\/(did:.+)$/, async (req, res, next) => {
    const did = req.params[0]
    // res.send(`resolving did="${did}"`)

    console.log('resolving', did)
    // await didClient.ready()
    const didDocument = await didClient.get(did)
    if (!didDocument)
      return res.status(404).json({
        error: `unabled to resolve DID=${did}`,
      })
    if (!didDocument.loaded) await didDocument.update()
    res.json(didDocument.value)
  })

  return app
}
