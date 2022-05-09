#!/usr/bin/env node

import { program } from 'commander'
import JlinxClient from 'jlinx-client'

program
  .option('-s --storage <path>', 'path to the jlinx directory', JlinxClient.defaultStoragePath)

async function beforeEach(opts){
  const jlinx = new JlinxClient({
    storagePath: program.opts().storage,
  })
  await jlinx.ready()
  return { jlinx }
}

program.action(async (opts) => {
  const { jlinx } = await beforeEach(opts)
})


program
  .command('resolve')
  .argument('<did>', 'the did to')
  // .option('--', 'the did to resolve')
  .action(resolve)

program
  .command('list')
  // .argument('<did>', 'the did to')
  // .option('--', 'the did to resolve')
  .action(list)

program
  .command('create')
  // .argument('<did>', 'the did to')
  .option('-H, --host <host>', 'the server to host the did', 'localhost')
  .option('-k --keys <keys>', 'a comma separated list of keys to include in the did document')
  .action(create)

program.parseAsync(process.argv)

async function resolve(did, opts){
  const { jlinx } = await beforeEach(opts)
  const didDocument = await jlinx.resolveDid(did)
  if (!didDocument){
    console.error(`unable to resolve`)
    return
  }
  await didDocument.update()
  console.log(didDocument.value)
}

async function list(opts){
  const { jlinx } = await beforeEach(opts)
  const didDocuments = await jlinx.didstore.all()
  console.log(`you have ${didDocuments.length} did documents`)
  for (const didDocument of didDocuments)
    console.log(didDocument.did, didDocument.writable ? '' : '(readonly)')
}

async function create(opts){
  const { jlinx } = await beforeEach(opts)
  const didDocument = await jlinx.createDid()
  // await didDocument.update()
  // console.log(`created did ${didDocument}`)
  console.log(didDocument)
}
