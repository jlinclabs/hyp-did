import Path from 'path'
import os from 'os'
import ini from 'ini'
import fs from 'fs/promises'

import Debug from 'debug'
const debug = Debug('jlinx:client')
import Didstore from './Didstore.js'
import Keystore from './Keystore.js'
import DidDocument from './DidDocument.js'
import {
  keyToString,
  createSigningKeyPair,
  fsExists,
} from './util.js'
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
    this.keystore = new Keystore({
      storagePath: path('keys')
    })
    // didstore can either be Didstore or RemoteDidStore
    this.didstore = new Didstore({
      storagePath: this.storagePath,
      keystore: this.keystore,
      // corestore: new Corestore(path('cores')),
    })
    // // TODO add support for RemoteDidStore
    // this.didstore = new RemoteDidstore({
    //   host: 'https://dids.jlinc.io',
    // })
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
      debug(`config: ${this.storagePath}`)
      if (!(await fsExists(this.storagePath))) await fs.mkdir(this.storagePath)
      try{
        this.config = await readConfig(this.configPath)
      }catch(error){
        if (error.code === 'ENOENT')
          this.config = await initConfig(this.configPath)
        else throw error
      }
    })()
    return this._ready
  }

  async resolveDid(did){
    // await this.ready()
    const didDocument = await this.didstore.get(did)
    return didDocument
  }

  async createDidDocument(){
    const didDocument = await this.didstore.create()
    const signingKeyPair = await this.keystore.createSigningKeyPair()
    const encryptingKeyPair = await this.keystore.createEncryptingKeyPair()
    const value = DidDocument.generate({
      did: didDocument.did,
      signingPublicKey: signingKeyPair.publicKey,
      encryptingPublicKey: encryptingKeyPair.publicKey,
    })
    await didDocument.amend(value)
    return didDocument
  }
}

async function readConfig(path){
  debug('reading config at', path)
  const source = await fs.readFile(path, 'utf-8')
  return ini.parse(source)
}

async function initConfig(path){
  debug('initializing config at', path)
  const config = {
    uuid: keyToString(createSigningKeyPair().publicKey),
  }
  debug('writing config', config)
  await fs.writeFile(path, ini.stringify(config))
  return config
}
