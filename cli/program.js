#!/usr/bin/env node

import Path from 'path'
import os from 'os'
import { program } from 'commander'
import JlinxApp from 'jlinx-app'

const defaultStoragePath = Path.join(os.homedir(), '.jlinx')


program
  .option('-s --storage <path>', 'path to the jlinx directory', defaultStoragePath)
  .option('-r --remote <host>', 'jlinx remote server', 'localhost')

program.hook('preAction', async () => {
  const {
    storage,
    host,
  } = program.opts()
  program.jlinx = new JlinxApp({
    storagePath: storage,
    removeServer: [],
  })
  await program.jlinx.ready()
})


export default program

// class JlinxCli {
//   constructor(opts){


//     this.keys = new KeyStore({
//       storagePath: Path.join(storage, 'keys')
//     })

//     this.dids = new DidTracker({
//       storagePath: Path.join(storage, 'dids')
//     })

//     const servers = []

//     servers.push(new JlinxServer()) // local
//     servers.push(new RemoteProxy()) //

//     this.client = new JlinxClient({
//       // storagePath: opts.storage,
//       // server: opts.host
//       //   ? new JlincHttpClient({ host: opts.host })
//       //   : new jlinxServer({
//       //     storagePath: opts.storage,
//       //   })
//       servers,
//     })

//   }


// }
