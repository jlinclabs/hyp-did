import Path from 'path'
import os from 'os'
import ini from 'ini'
import fs from 'fs/promises'
import Corestore from 'corestore'
import Didstore from './Didstore.js'
import Keystore from './Keystore.js'
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

  static get defaultStoragePath(){ return Path.join(os.homedir(), '.jlinx') }

  constructor(opts){
    const path = (...parts) => Path.join(this.storagePath, ...parts)
    this.storagePath = opts.storagePath || JlinxClient.defaultStoragePath
    this.configPath = path('config.ini')
    // this.storagePath is required
    // this.server = opts.servers // get from config
    this.corestore = new Corestore(path('cores'))
    this.keystore = new Keystore(path('keys'))
    this.didstore = new Didstore(path('dids'))
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + '  configPath: ' + opts.stylize(this.configPath, 'string') + '\n' +
      // indent + '  size: ' + opts.stylize(this.size, 'number') + '\n' +
      // indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
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
