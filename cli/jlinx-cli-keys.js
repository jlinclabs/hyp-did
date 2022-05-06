#!/usr/bin/env node

import { program } from 'commander'
import JlinxClient from 'jlinx-core/JlinxClient.js'


program
  .option('-s --storage <path>', 'path to the jlinx directory', JlinxClient.defaultStoragePath)

program.action((...args) => {
  console.log('keys progrsm defualt action')
})

program
  .command('list')
  // .argument('<did>', 'the did to')
  // .option('--', 'the did to resolve')
  .action(list)

program
  .command('create')
  // .argument('<did>', 'the did to')
  .option('-t --type <type>', 'signing or encrypting', 'signing')
  .action(create)

program.parseAsync(process.argv)

async function beforeEach(opts){
  const jlinx = new JlinxClient({
    storagePath: opts.storage,
  })
  return { jlinx }
}

async function list(opts){
  const { jlinx } = await beforeEach(opts)
  const keys = await jlinx.keystore.all()
  for (const keyPair of keys)
    console.log(`${keyPair.publicKeyAsString} (${keyPair.type})`)
}

async function create(opts){
  const { jlinx } = await beforeEach(opts)
  let keyPair
  if (opts.type === 'signing')
    keyPair = await jlinx.keystore.createSigningKeyPair()
  else if (opts.type === 'encrypting')
    keyPair = await jlinx.keystore.createEncryptingKeyPair()
  else throw new Error(`invalid type "${opts.type}"`)
  console.log(`created ${keyPair.type} key pair: ${keyPair.publicKeyAsString}`)
}
