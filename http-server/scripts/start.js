#!/usr/bin/env node

import Path from 'path'
import { fileURLToPath } from 'url'
import hypDidServer from '../index.js'

const options = {}
options.storagePath = (
  process.env.HYP_DID_SERVER_STORAGE_PATH ||
  Path.resolve(fileURLToPath(import.meta.url), '../../tmp/dids')
)
options.port = process.env.PORT || 59736
console.log(options)
const server = hypDidServer(options)
server.start()
