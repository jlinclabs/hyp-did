// import Debug from 'debug'
// import { URL } from 'node:url'
// import fetch from 'node-fetch'
// import Router from 'express-promise-router'
// import wait from 'app-shared/shared/wait.js'
// import prisma from 'app-shared/server/prisma.js'
// import jlinxApp from './jlinxApp.js'
// import { Context } from './Context.js'
// import { MissingArgumentError } from './errors.js'

// const debug = Debug('jlinx.api')
// const router = Router()
// export default router

// // TODO stop giving app's cookies

// router.post('/login', async (req, res) => {
//   const host = await getHostFromReferer(req)
//   const { jws } = req.body
//   const { did: agentDid } = await jlinxApp.verifySignature(jws)
//   const context = await getAgentContext({did: agentDid})
//   const agent = await context.getAgent()
//   const appDid = await getAppDid(agent,host)
//   const loginAttemptId = await context.commands.loginAttempts.create({
//     userId: context.userId,
//     host,
//   })
//   const profile = await context.queries.profile.get()
//   const jwe = await agent.encrypt({
//     loginAttemptId,
//     checkStatusAt: `${process.env.APP_ORIGIN}/api/jlinx/v1/login/${loginAttemptId}`,
//     profile,
//   }, [appDid])
//   res.json({ jwe })
// })

// router.get('/login/:id', async (req, res) => {
//   const { id } = req.params
//   const host = await getHostFromReferer(req)

//   let closed = false
//   req.on('close', function(){ closed = true })
//   let loginAttempt
//   // TODO ensure this doesnt loop forever
//   while (loginAttempt?.resolved !== true) {
//     if (closed) return
//     loginAttempt = await req.context.queries.loginAttempts.getById({id})
//     console.log({loginAttempt})
//     if (!loginAttempt.resolved) await wait(200)
//   }
//   if (closed) return
//   const context = await getAgentContext({
//     userId: loginAttempt.userId
//   })
//   const agent = await context.getAgent()
//   const appDid = await getAppDid(agent,host)
//   const profile = await context.queries.profile.get()

//   const jwe = await agent.encrypt(
//     {
//       // host: jlinxApp.host,
//       accepted: loginAttempt.accepted,
//       did: agent.did,
//       profile,
//     },
//     [appDid]
//   )
//   res.json({ jwe })
// })

// router.get('/profile/:did', async (req, res) => {
//   const { did } = req.params
//   const host = await getHostFromReferer(req)
//   const context = await getAgentContext({ did })
//   const agent = await context.getAgent()
//   const appDid = await getAppDid(agent,host)
//   const profile = await context.queries.profile.get()
//   const jwe = await agent.encrypt(
//     {...profile, did},
//     [appDid]
//   )
//   res.json({ jwe })
// })



// router.get('/documents/:id', async (req, res) => {
//   const host = await getHostFromReferer(req)
//   // const context = await getAgentContext({ did })
//   // const agent = await context.getAgent()
// })

// router.post('/documents', async (req, res) => {
//   const host = await getHostFromReferer(req)
//   const { did, name, value } = req.body
//   const context = await getAgentContext({ did })
//   const agent = await context.getAgent()
//   const appDid = await getAppDid(agent,host)

//   // TODO ensure access control here
//   const doc = await context.commands.documents.create({ name, value })
//   console.log('CREATED DOC', doc)
//   const jwe = await agent.encrypt(doc, [appDid])
//   res.json({ jwe })
// })

// router.post('/documents/:id', async (req, res) => {
//   const { id } = req.params
//   if (!id) throw new MissingArgumentError('id', id)
//   const { did, name, value } = req.body
//   console.log('UPDATING DOC', { id, did, name, value })
//   const host = await getHostFromReferer(req)
//   const context = await getAgentContext({ did })
//   const agent = await context.getAgent()
//   const appDid = await getAppDid(agent,host)

//   // TODO ensure access control here
//   const doc = await context.commands.documents.update({ id, name, value })
//   console.log('UPDATED DOC', doc)
//   const jwe = await agent.encrypt(doc, [appDid])
//   res.json({ jwe })
// })






// router.use((req, res, next) => {
//   res.status(404).json({})
// })

// // TODO dry up this dup error hadling into app-shared
// router.use(async (error, req, res, next) => {
//   console.error('rendering JSON error STATUS=500', error)
//   res.status(500)
//   res.json({
//     error: {
//       message: error?.message ?? error,
//       stack: error?.stack,
//     }
//   })
// })


// // HELPERS

// async function getHostFromReferer(req) {
//   return new URL(req.headers.referer).host
// }

// async function getAppDidDocument(agent, host) {
//   const { didDocument } = await agent.resolveDID(`did:web:${host}`)
//   return didDocument
// }

// async function getAppDid(agent, host){
//   const didDocument = await getAppDidDocument(agent, host)
//   return didDocument.id
// }

// async function getAgentContext({did, userId}){
//   const record = await prisma.user.findUnique({
//     where: did ? { did } : { id: userId },
//     select: {
//       id: true,
//       didSecret: true,
//       vaultKey: true,
//     }
//   })
//   if (!record) throw new Error(`unable to find agent with did="${did}"`)

//   const context = new Context({ userId: record.id })
//   return context
//   // const { id, didSecret, vaultKey } = record
//   // return await Agent.open({ did, didSecret, vaultKey })
// }

// //
// // async function getAppDid(host){
// //   const res = await fetch(
// //     `https://${host}/.well-known/did.json`,
// //     {
// //       method: 'GET',
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Accept': 'application/json',
// //       },
// //     }
// //   )
// //   if (!res .ok){
// //     console.log(res )
// //     throw new Error(`failed to get id of requesting app`)
// //   }
// //   const { didDocument } = await res.json()
// //   console.log({ didDocument })
// //   return didDocument
// // }