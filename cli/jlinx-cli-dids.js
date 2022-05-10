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
  // .option('-H, --host <host>', 'the server to host the did', 'localhost')
  .option('-k --keys <keys>', 'a comma separated list of keys to include in the did document')
  .option('-R --replicate', 'replicate new did on remote did servers')
  .action(create)

program
  .command('replicate')
  .argument('<did>', 'the did to replicate')
  .action(replicate)

program
  .command('track')
  .argument('<did>', 'the did to track')
  .action(track)

program
.command('untrack')
  .argument('<did>', 'the did to track')
  .action(untrack)

program.parseAsync(process.argv)

async function resolve(did, opts){
  const { jlinx } = program
  const didDocument = await jlinx.resolveDid(did)
  if (didDocument){
    program.log(didDocument)
  }else{
    program.error(`unable to resolve`)
  }
  // await didDocument.update()
  // console.log(didDocument.value)
}

async function list(opts){
  const { jlinx } = program
  const dids = await jlinx.dids.all()

  program.info(`you have ${dids.length} did documents`)
  for (const did of dids){
    const writable = jlinx.keys.has(didToKey(did))
    program.log(did, writable ? '' : '(readonly)')
  }
}

async function create(opts){
  const { jlinx } = program
  const didDocument = await jlinx.createDid()
  const did = didDocument.id
  program.info('Created DID Document', did)
  program.log(didDocument)
  if (opts.replicate) await replicate(did, {})
}

async function replicate(did, opts){
  program.info('Replicating DID', did)
  await program.jlinx.replicateDid(did)
}


async function track(did, opts){
  const { jlinx } = program
  const didDocument = await jlinx.resolveDid(did)
  const dids = await jlinx.dids.set(did)
  console.log(`tracking ${did}`)
}

async function untrack(did, opts){
  const { jlinx } = program
  if (await jlinx.dids.has(did)){
    await jlinx.dids.delete(did)
    console.log(`stopped tracking ${did}`)
  }else{
    console.log(`wasn't tracking ${did}`)
  }
}
