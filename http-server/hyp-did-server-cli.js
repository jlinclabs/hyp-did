#!/usr/bin/env node

process.title = "jlinx-http-server"
import Path from 'path'
import { program } from 'commander'

program
  .option('-p, --port <port>')
  .option('-h, --host <host>')
  .option('-S, --store <path/to/storage>')

program.parse()
const options = program.opts()
console.log(options)

import hypDidServer from './index.js'

const server = hypDidServer({
  storagePath: options.store ? Path.resolve(options.store) : undefined,
  port: options.port,
})

server.start()

// import Path from 'path'
// import operatingSystem from 'os'
// import subcommand from 'subcommand'
// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'
// import chalk from 'chalk'
// import { DidClient } from 'jlinx'

// const packageJson = JSON.parse(fs.readFileSync(path.join(fileURLToPath(import.meta.url), '../../package.json'), 'utf8'))
