#!/usr/bin/env node

import hypDidServer from '../index.js'

const optionsSpec = {
  port: ['PORT'],
  jlinxStoragePath: ['JLINX_STORAGE'],
}
const options = {}
for (const [option, [envVar]] of Object.entries(optionsSpec)){
  const value = process.env[envVar]
  if (!value) throw new Error(`environment variable ${envVar} is missing`)
  options[option] = value
}

console.log(options)

const server = hypDidServer(options)
server.start()
