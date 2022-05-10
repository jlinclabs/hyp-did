#!/usr/bin/env node

import Debug from 'debug'
import Path from 'path'
import os from 'os'
import { program } from 'commander'
import JlinxApp from 'jlinx-app'

const defaultStoragePath = Path.join(os.homedir(), '.jlinx')

program.debug = Debug('jlinx:cli')

program
  .option('-s --storage <path>', 'path to the jlinx directory', defaultStoragePath)
  .option('-r --remote <host>', 'jlinx remote server')

program.hook('preAction', async () => {
  const { storage, remote } = program.opts()
  program.debug('OPTIONS', { storage, remote })
  program.jlinx = new JlinxApp({
    storagePath: storage,
    remote,
  })
})
program.hook('postAction', async () => {
  program.debug('shutting down…')
  await program.jlinx.destroy()
})

export default program
