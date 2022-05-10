#!/usr/bin/env node

import program from './program.js'

program
  .command('list')
  // .option('-s --storage <path>')
  .action(list)

program
  .command('add')
  .action(add)

program.parseAsync(process.argv)


async function list(opts){
  const { jlinx } = program
  const keys = await jlinx.keys.all()
  for (const keyPair of keys)
    console.log(`${keyPair.id} (${keyPair.type})`)
}

async function add(opts){

}
