#!/usr/bin/env node

process.title = "hyp-did"

import Path from 'path'
import operatingSystem from 'os'
import subcommand from 'subcommand'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import fetch from 'node-fetch'
import { DidClient } from 'hyp-did'

const packageJson = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'))

export const commands = {
  create: {
    name: 'create',
    description: 'Create a new did',
    usage: {
      simple: 'Create a new did',
      full: 'Create a new did and hypercore'
    },
    async command({ didClient }){

      const didDocument = await didClient.create()
      const { did } = didDocument
      console.log('created', didDocument)
      console.log(didDocument.value)

      await didClient.ready()

      const didDocument2 = await replicate(didDocument.did)
      console.log({ didDocument2 })

      // await new Promise((x,y) => {})

      // setInterval(() => {
      //   didClient.status().then(console.log)
      // }, 1000);
      // await new Promise(resolve => {
      //   setTimeout(resolve, 9999999)
      // })

      // TODO write the private keys somewhere we know where to look
      //      so we can use them for updates
      //              doesnt the corestore do this?
      // TODO take a flag to force-replicate it
    }
  },
  resolve: {
    name: 'resolve',
    description: 'get the did document for the given did',
    usage: {
      simple: 'get did document',
      full: 'get the did document for the given did',
    },
    async command({ didClient, _: [did], replicate }){
      console.log('resolving', did)
      // await didClient.ready()
      const didDocument = await didClient.get(did)
      if (!didDocument) return fail(`unabled to resolve ${did}`)
      if (!didDocument.loaded) await didDocument.update()
      console.log(didDocument.value)
      if (replicate) await didDocument.replicate()
    }
  },
  superseed: {
    name: 'superseed',
    description: 'superseed',
    usage: {
      simple: 'superseed',
      full: 'superseed',
    },
    async command(args){
      console.log('superseed', args)
    }
  },
  revoke: {
    name: 'revoke',
    description: 'revoke',
    usage: {
      simple: 'revoke',
      full: 'revoke',
    },
    async command(args){
      console.log('revoke', args)
    },
  },
  history: {
    name: 'history',
    description: 'get the history for the given did',
    usage: {
      simple: 'get the history for the given did',
      full: 'get the history for the given did'
    },
    command(args){
      console.log('history', args)
    },
  },
}

Object.values(commands).forEach(wrapCommand)

// match & run the command
subcommand({ commands: Object.values(commands), none })(process.argv.slice(2))

function wrapCommand(cmd){
  const { command } = cmd
  cmd.command = async function(args){
    if (args.v || args.verbose) args.verbose = true
    if (args.h || args.help) {
      usage(cmd)
      process.exit(0)
    }

    let storagePath = Path.join(operatingSystem.homedir(), '.hyp-did', 'storage')
    if (args.verbose){
      console.error(`${chalk.gray(`storing hypercores in ${storagePath}`)}`)
    }

    args.didClient = new DidClient({
      storagePath
    })

    try{
      await command(args)
    }catch(error){
      fail(error)
    }finally{
      await args.didClient.destroy()
      process.exit(0)
    }
  }
}

function none(args){
  if (args.version){
    console.log(packageJson.version)
    process.exit(0)
  }
  if (args._[0]){
    console.error(`Invalid command: ${args._[0]}`)
  }else{
    usage()
  }
}

function fail(error) {
  console.error(error)
  // console.error(chalk.red(`${error}\n`))
  process.exit(1)
}

function usage(cmd){
  if (cmd) {
    console.error(simple(cmd))
    if (cmd.usage.full) console.error(cmd.usage.full)
    else console.error('')
    return
  }

  console.error(`Usage: ${chalk.bold(process.title)} <command> ${chalk.gray(`[opts...]`)}

  ${simple(commands.create)}
  ${simple(commands.resolve)}
  ${simple(commands.superseed)}
  ${simple(commands.revoke)}
  ${simple(commands.history)}

  ${chalk.green(`Learn more at ${packageJson.homepage}`)}
`)
}

function simple (cmd) {
  return `${chalk.bold(`${process.title} ${cmd.name}`)} ${cmd.usage.simple ? `${cmd.usage.simple} -` : `-`} ${cmd.description}`
}


async function replicate(did){
  console.log(`replicating DID="${did}"…`)
  const start = Date.now()
  while (Date.now() - start < 60000){
    const response = await fetch(`http://localhost:59736/${did}`, {
      method: 'get',
      headers: {'Accept': 'application/json'}
    })
    const didDocument2 = await response.json()
    console.log('REP RES?->', didDocument2)
    if (didDocument2 && didDocument2.did === did) return didDocument2
  }
  console.log(`replicated DID="${did}"`)
}
