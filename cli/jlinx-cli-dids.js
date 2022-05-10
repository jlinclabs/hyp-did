#!/usr/bin/env node

import program from './program.js'
import { didToKey } from 'jlinx-core/util.js'

program
  .command('resolve')
  .argument('<did>', 'the did to resolve')
  .action(resolve)

program
  .command('list')
  .action(list)

program
  .command('create')
  .option('-H, --host <host>', 'the server to host the did', 'localhost')
  .option('-k --keys <keys>', 'a comma separated list of keys to include in the did document')
  .action(create)

program
  .argument('<did>', 'the did to track')
  .command('track')
  .action(track)

program
  .argument('<did>', 'the did to track')
  .command('untrack')
  .action(untrack)

program.parseAsync(process.argv)

async function resolve(did, opts){
  const { jlinx } = program
  const didDocument = await jlinx.resolveDid(did)
  if (didDocument){
    console.log(didDocument)
  }else{
    console.error(`unable to resolve`)
  }
  // await didDocument.update()
  // console.log(didDocument.value)
}

async function list(opts){
  const { jlinx } = program
  const dids = await jlinx.dids.all()
  console.log(`you have ${dids.length} did documents`)
  for (const did of dids){
    const writable = jlinx.keys.has(didToKey(did))
    console.log(did, writable ? '' : '(readonly)')
  }
}

async function create(opts){
  const { jlinx } = program
  const didDocument = await jlinx.createDid()
  // await didDocument.update()
  // console.log(`created did ${didDocument}`)
  console.log(didDocument)
}

async function track(did, opts){
  const { jlinx } = program
  const didDocument = await jlinx.resolveDid(did)
  const dids = await jlinx.dids.set(did)
  console.log(`tracking ${did}`)
}

async function untrack(did, opts){
  const { jlinx } = program
  await jlinx.dids.delete(did)
  console.log(`stopped tracking ${did}`)
}
