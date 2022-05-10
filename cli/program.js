import Debug from 'debug'
import Path from 'path'
import os from 'os'
import chalk from 'chalk'
import { program } from 'commander'
import JlinxApp from 'jlinx-app'

const defaultStoragePath = Path.join(os.homedir(), '.jlinx')

program.debug = Debug('jlinx:cli')

program
  .option('-v --verbose', 'log more information')
  .option('-s --storage <path>', 'path to the jlinx directory', defaultStoragePath)
  .option('-r --remote <host>', 'jlinx remote server')

program.hook('preAction', async () => {
  const { verbose, storage, remote } = program.opts()
  program.verbose = verbose
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

program.log = (...args) => console.log(...args)
program.error = (...args) => console.error(...args)
program.info = (...args) => {
  if (typeof args[0] === 'string') args[0] = chalk.white(args[0])
  console.log(...args)
}
program.moreInfo = (...args) => {
  if (program.verbose) return program.info(...args)
}

export default program
