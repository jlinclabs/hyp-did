#!/usr/bin/env node
'use strict';

import Hyperswarm from 'hyperswarm'
import { keyToString, keyToBuffer, keyToDid } from './util.js'
import topic from './topic.js'

const swarm = new Hyperswarm({
  // port ????
})
console.log('starting swarm boostrap server as', keyToString(swarm.keyPair.publicKey))

swarm.on('connection', function (connection, info) {
  const id = keyToString(connection.remotePublicKey)
  console.log('connection open:', id, info)
  // connection.on('open', () => {

  // })
  connection.on('close', () => {
    console.log('connection close:', id)
  })

  connection.on('error', error => {
    console.error('connection error:', id, `${error}`)
  })
  // Do something with `connection`
  // `info` is a PeerInfo object
})

console.log(`joining topic: "${topic}"`)

const discovery = swarm.join(topic, { server: true })

process.once('SIGINT', async function () {
  console.log('destroying boostrapper...')
  await Promise.all([
    // swarm.flush(),
    discovery.destroy(),
    swarm.destroy(),
  ])
  process.exit(0)
})

discovery.flushed().then(async () => {
  console.log('discovery flushed')
  // console.log('status:', await swarm.status(topic))
})



// import DHT from '@hyperswarm/dht'

// const PORT = process.env.PORT || 49736

// const bootstrapper = DHT.bootstrapper(PORT, {
//   ephemeral: true,
//   seed: DHT.hash(Buffer.from('hyperlinc')),
// })

// bootstrapper.ready().then(() => {
//   console.log(
//     'Hyperswarm bootstrapper running on port',
//     bootstrapper.address(),
//   )
// })

// bootstrapper.on('add-node', node => {
//   console.log('node added', node.id.toString('hex'))
// })

// bootstrapper.on('remove-node', node => {
//   console.log('node removed', node.id.toString('hex'))
// })

// process.once('SIGINT', async function () {
//   console.log('Closing server...')
//   await bootstrapper.destroy()
//   process.exit(0)
// })



// MAFINTOSH EXAMPLE
// https://discord.com/channels/709519409932140575/709522119335346196/900698651914018856
// const b = HyperswarmDHT.bootstrapper(0)
// await b.ready()
// const bootstrap = [{ host: '127.0.0.1', port: b.address().port }]
// const nodes = [b]
// while (nodes.length < 5) { // 5 is arbitrary, just needs >2
//   // in general here you'd only mess with the ephemeral flag for testing
//   const node = new HyperswarmDHT({ bootstrap, ephemeral: false })
//   await node.ready()
//   nodes.push(node)
// }
// // you prob want to destroy the nodes array on test teardown
// return bootstrap
