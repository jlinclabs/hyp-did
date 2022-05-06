#!/usr/bin/env node

process.title = "jlinx"

import Path from 'path'
import operatingSystem from 'os'
import subcommand from 'subcommand'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import fetch from 'node-fetch'
import DidClient from 'jlinx-core/DidClient.js'
import Keychain from 'jlinx-core/Keychain.js'

const packageJson = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'))

// MOVE THIS TO A ~/.jlinx-cli/config
const HOSTS = (process.env.HYP_DID_SERVERS || '').split(',').filter(x => x)

export const commands = {
  create: {
    name: 'create',
    description: 'Create a new did',
    usage: {
      simple: 'Create a new did',
      full: 'Create a new did and hypercore'
    },
    async command({ keychain, didClient }){
      // these could be set to existing keys using flags
      const signingKeyPair = await keychain.createSigningKeyPair()
      const encryptingKeyPair = await keychain.createEncryptingKeyPair()

      // here is where we could store keys locally OR use a remote did server
      // maybe we use different didClient classes for local vs remote?
      //    we need a local keychain either way
      const didDocument = didClient.create({ signingKeyPair, encryptingKeyPair })
      console.log(didDocument.value)

      // create a new did keyPair
      const didKeyPair = await keychain.createSigningKeyPair()
      console.log({ didKeyPair, signingKeyPair, encryptingKeyPair })
      const didDocument = await didClient.create({
        didKeyPair,
        signingKeyPair,
        encryptingKeyPair,
      })
      const { did } = didDocument
      console.log(didDocument.value)
      // if (HOSTS.length === 0) return
      // console.log(`replicating…`)
      // await didClient.ready()
      // console.log({ HOSTS })
      // await Promise.all(HOSTS.map(host => replicate(host, didDocument.did)))
    }
  },
  keys: {
    name: 'keys',
    description: 'list all keys',
    usage: {
      simple: 'list all keys',
      full: 'list all locally cached keys'
    },
    async command({ keychain }){
      console.log(keychain)
      const keys = await keychain.all()
      if (keys.length === 0){
        console.log(`you do not have any keys stored in ${keychain.storagePath}`)
      }else {
        console.log(`you have ${keys.length} keys stored in ${keychain.storagePath}`)
        for (const key of keys) console.log(key)
      }
    }
  },
  list: {
    name: 'list',
    description: 'list all dids',
    usage: {
      simple: 'list all dids',
      full: 'list all locally cached dids'
    },
    async command({ keychain, didClient }){
      console.log(keychain)

      // TODO we need to start storing DIDs in in the .jlinx dir too
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
    name: 'supersede',
    description: 'supersede',
    usage: {
      simple: 'supersede',
      full: 'supersede',
    },
    async command(args){
      console.log('supersede', args)
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

    const storagePath = Path.join(operatingSystem.homedir(), '.jlinx')
    // TODO ensure ~/.jlinx permissions

    if (args.verbose){
      console.error(`${chalk.gray(`storing hypercores in ${storagePath}`)}`)
    }

    // it would be nice if we could know about local and remove dids
    // if we have a local did store that stores dids in a way that allows
    // us to know metadata about the did. like which did server holds its
    // core's private keys

    args.dids = new DidStore({
      storagePath: Path.join(storagePath, 'dids'),
    })

    // // here is where we alternately use a remote did server
    // args.dids = new RemoteDidStore({
    //   storagePath: Path.join(storagePath, 'dids'),
    // })

    args.didClient = new DidClient({
      storagePath: Path.join(storagePath, 'dids'),
    })

    args.keychain = new Keychain({
      storagePath: Path.join(storagePath, 'keys'),
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
  ${simple(commands.supersede)}
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
