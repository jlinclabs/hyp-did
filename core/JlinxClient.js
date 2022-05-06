import Path from 'path'
import ini from 'ini'
import fs from 'fs/promises'
import Corestore from 'corestore'
import { keyToString, createSigningKeyPair } from './util.js'
/*
 * ~/.jlinx
 * ~/.jlinx/config
 * ~/.jlinx/cores
 * ~/.jlinx/dids
 * ~/.jlinx/dids/${did} (containts did document)
 * ~/.jlinx/keys/${publicKeyAsUrlSafeMd5} (contains private key)
 */
export default class JlinxClient {

  constructor(opts){
    this.storagePath = opts.storagePath // required
    this.configPath = Path.join(this.storagePath, 'config.ini')
    // this.storagePath is required
    // this.server = opts.servers // get from config
    this.corestore = new Corestore(Path.join(this.storagePath, 'cores'))
  }

  ready(){
    if (!this._ready) this._ready = (async () => {
      console.log('looking at', this.storagePath)
      if (!(await fs.stat(this.storagePath))) await fs.mkdir(this.storagePath)
      try{ this.config = await readConfig(this.configPath) }
      catch(error){
        if (error.code === 'ENOENT') this.config = await initConfig(this.configPath)
        else throw error
      }
      console.log('CONFIG', this.config)
    })()
    // mkdir this.storagePath
    // read config
    // if it doesnt exists initialize it with a new set of keys
    return this._ready
  }

  async resolveDid(did){
    await this.ready()
  }

}


async function readConfig(path){
  console.log('reading config at', path)
  const source = await fs.readFile(path, 'utf-8')
  return ini.parse(source)
}

async function initConfig(path){
  console.log('initializing config at', path)
  const config = {
    uuid: keyToString(createSigningKeyPair().publicKey),
  }
  console.log('writing config', config)
  const source = await fs.writeFile(path, ini.stringify(config))
  return config
}
