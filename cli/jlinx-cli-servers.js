#!/usr/bin/env node

import program from './program.js'

program
  .command('list')
  // .option('-s --storage <path>')
  .action(list)

program
  .command('add')
  .argument('<host>', 'the hostname of the jlinx did server')
  // .argument('<publicKey>', 'the publicKey of the jlinx did server')
  .action(add)

  program
  .command('remove')
  .argument('<host>', 'the hostname of the jlinx did server')
  .action(remove)

program.parseAsync(process.argv)

async function list(opts){
  const { jlinx } = program
  const servers = await jlinx.getServers()
  console.log(`you have ${servers.length} servers`)
  for (const server of servers)
    console.log(server.host, '-', server.publicKey)
}

async function add(host, opts){
  const { jlinx } = program
  await jlinx.addServer({ host })
  console.log(`added jlinx remote server: ${host}`)
}

async function remove(opts){

}
