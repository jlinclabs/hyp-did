#!/usr/bin/env node

import Path from 'path'
import os from 'os'
import { program } from 'commander'
import JlinxClient from 'jlinx-client'

const defaultStoragePath = Path.join(os.homedir(), '.jlinx')


program
  .option('-s --storage <path>', 'path to the jlinx directory', defaultStoragePath)
  .option('-h --host <host>', 'jlinx server host', 'localhost')

program.hook('preAction', async () => {
  program.jlinx = new JlinxCli(program.opts())
  await program.jlinx.ready()
})


export default program

class JlinxCli {
  constructor(opts){
    const {
      storage,
      host,
    } = opts

    this.keys = new KeyStore({
      storagePath: Path.join(storage, 'keys')
    })

    this.dids = new DidTracker({
      storagePath: Path.join(storage, 'dids')
    })

    const servers = []

    servers.push(new JlinxServer()) // local
    servers.push(new RemoteProxy()) //

    this.client = new JlinxClient({
      // storagePath: opts.storage,
      // server: opts.host
      //   ? new JlincHttpClient({ host: opts.host })
      //   : new jlinxServer({
      //     storagePath: opts.storage,
      //   })
      servers,
    })

  }


}
