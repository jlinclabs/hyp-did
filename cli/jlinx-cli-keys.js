#!/usr/bin/env node

import program from './program.js'

program
  .command('list')
  // .option('-s --storage <path>')
  .action(list)

program
  .command('create')
  .option('-t --type <type>', 'signing or encrypting', 'signing')
  .action(create)

program.parseAsync(process.argv)


async function list(opts){
  const { jlinx } = program
  const keys = await jlinx.keys.all()
  for (const keyPair of keys)
    console.log(`${keyPair.id} (${keyPair.type})`)
}

async function create(opts){
  const { jlinx } = program
  let keyPair
  if (opts.type === 'signing')
    keyPair = await jlinx.keys.createSigningKeyPair()
  else if (opts.type === 'encrypting')
    keyPair = await jlinx.keys.createEncryptingKeyPair()
  else throw new Error(`invalid type "${opts.type}"`)
  console.log(`created ${keyPair.type} key pair: ${keyPair.id}`)
}
