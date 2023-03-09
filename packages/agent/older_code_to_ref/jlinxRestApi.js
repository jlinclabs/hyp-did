// import Router from 'express-promise-router'
// import prisma from '../prisma/client.js'
// import Agent from './Agent/index.js'
// import { JlinxClient } from './jlinx.js'
//
// const router = Router()
//
// router.post('/agreements/signatures', async (req, res) => {
//   const { agreementId, signatureId } = req.body
//   console.log('RECIEVING SIGNATURE', { agreementId, signatureId })
//   const jlinx = new JlinxClient()
//
//   // get agentDid for agreement
//   const agreement = await jlinx.get(agreementId)
//   const did = agreement.metadata.controllers[0]
//
//   // ack signature
//   const agent = await openAgent(did)
//   await agent.agreements.ackSignature(signatureId)
//   res.json({ success: true })
// })
//
// export default router
//
//
// async function openAgent(did){
//   const record = await prisma.agent.findUnique({
//     where: { did },
//     select: {
//       didSecret: true,
//       vaultKey: true,
//     }
//   })
//   if (!record) {
//     throw new Error(`agent not hosted here did=${did}`)
//   }
//   return await Agent.open({
//     did,
//     didSecret: Buffer.from(record.didSecret, 'hex'),
//     vaultKey: record.vaultKey,
//   })
// }
