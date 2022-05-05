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
import DidClient from 'hyp-did/DidClient.js'
import IdentitiesStore from 'hyp-did/IdentitiesStore.js'

const packageJson = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'))

// MOVE THIS TO A ~/.hyp-did-cli/config
const HOSTS = (process.env.HYP_DID_SERVERS || '').split(',').filter(x => x)

export const commands = {
  create: {
    name: 'create',
    description: 'Create a new did',
    usage: {
      simple: 'Create a new did',
      full: 'Create a new did and hypercore'
    },
    async command({ identitiesStore, didClient }){
      const identity = await identitiesStore.create()
      const didDocument = await didClient.create()
      const { did } = didDocument
      console.log(didDocument.value)
      if (HOSTS.length === 0) return
      console.log(`replicating…`)
      await didClient.ready()
      console.log({ HOSTS })
      await Promise.all(HOSTS.map(host => replicate(host, didDocument.did)))
    }
  },
  list: {
    name: 'list',
    description: 'list all dids',
    usage: {
      simple: 'list all dids',
      full: 'list all locally cached dids'
    },
    async command({ identitiesStore, didClient }){
      console.log(identitiesStore)
      await identitiesStore.open() // .ready()?
      console.log(identitiesStore)

      // TODO we need to start storing DIDs in in the .hyp-did dir too
      // and read a file of dids

      // ~/.jlinx/identites
      // // await didClient.ready()


      // console.log(didClient.corestore)
      // await didClient.corestore.ready()
      // const keys = [...didClient.corestore.cores.keys()]
      // console.log('size', didClient.corestore.cores.size)
      // console.log('keys', keys)
      // console.log(...keys)
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
  supersede: {
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

    const storagePath = Path.join(operatingSystem.homedir(), '.hyp-did')
    // TODO ensure ~/.hyp-did permissions

    if (args.verbose){
      console.error(`${chalk.gray(`storing hypercores in ${storagePath}`)}`)
    }

    args.didClient = new DidClient({
      storagePath: Path.join(storagePath, 'dids'),
    })

    args.identitiesStore = new IdentitiesStore({
      storagePath: Path.join(storagePath, 'identities'),
      didClient: args.didClient, // ???
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


async function replicate(host, did){
  const url = `${host}/${did}`
  const start = Date.now()
  let didDocument
  while (Date.now() - start < 60000){
    const response = await fetch(url, {
      method: 'get',
      headers: {'Accept': 'application/json'}
    })
    didDocument = await response.json()
    console.log(didDocument)
    if (!didDocument || didDocument.error) continue
    if (didDocument && didDocument.did === did)
      return console.log(`replicated at ${url}`)
  }
  if (!didDocument || didDocument.error)
    throw new Error(`unable to replicated ${did} on ${host}: ${didDocument.error || ''}`)
  if (didDocument.did !== did)
      throw new Error(`did mismatch. expected ${didDocument.did} === ${did}`)
}
