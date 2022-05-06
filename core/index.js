import Path from 'path'
import ini from 'ini'
import { mkdir, chown, readdir, readFile, writeFile } from 'fs/promises'

/*
 * ~/.jlinx
 * ~/.jlinx/config
 * ~/.jlinx/cores
 * ~/.jlinx/dids
 * ~/.jlinx/dids/${did} (containts did document)
 * ~/.jlinx/keys/${publicKeyAsUrlSafeMd5} (contains private key)
 */
export default class Jlinx {

  constructor(opts){
    this.server = opts.servers
    this.storagePath = opts.storagePath
    // this.storagePath is required
    this.corestore = new Corestore(Path.join(this.storagePath, 'cores'))
  }

  ready(){
    if (this._ready) return this._ready
    this._ready =

    await mkdir(this.storagePath)
    let config = await readConfig(this.storagePath)
    // mkdir this.storagePath
    // read config
    // if it doesnt exists initialize it with a new set of keys
  }

}


async function readConfig(storagePath){
  const path = Path.join(this.storagePath, 'config')
  const source = await readFile(path)
  return ini.parse(source)
}
