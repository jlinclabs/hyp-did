#!/usr/bin/env node

import hypDidServer from '../index.js'

const optionsSpec = {
  port: ['PORT'],
  storagePath: ['JLINX_STORAGE'],
  agentPublicKey: ['JLINX_AGENT_PUBLIC_KEY'],
}
const options = {}
for (const [option, [envVar]] of Object.entries(optionsSpec)){
  const value = process.env[envVar]
  if (!value) throw new Error(`environment variable ${envVar} is missing`)
  options[option] = value
}

console.log(options)

const server = hypDidServer({
  port: process.env.PORT,
  storagePath: process.env.JLINX_STORAGE,
  agentPublicKey: process.env.JLINX_AGENT_PUBLIC_KEY,
})
server.start()
