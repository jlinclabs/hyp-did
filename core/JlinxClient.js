import Path from 'path'
import os from 'os'
import ini from 'ini'
import fs from 'fs/promises'
import Corestore from 'corestore'
import Didstore from './Didstore.js'
import Keystore from './Keystore.js'
import DidDocument from './DidDocument.js'
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
    this.keystore = new Keystore({
      storagePath: path('keys')
    })
    // didstore can either be Didstore or RemoteDidStore
    this.didstore = new Didstore({
      storagePath: path('dids'),
      keystore: this.keystore,
      corestore: this.corestore,
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

  async createDidDocument(){
    // get a new did from either out own didstore or a remote didstore

    console.log('creating new did')
    const did = await this.didstore.createKeypair()
    console.log({ did })

    console.log('generating keys')
    const signingKeyPair = await this.keystore.createSigningKeyPair()
    const encryptingKeyPair = await this.keystore.createEncryptingKeyPair()

    console.log({
      signingKeyPair,
      encryptingKeyPair,
    })

    const didDocument = DidDocument.generate({
      did,
      signingPublicKey: signingKeyPair.publicKey,
      encryptingPublicKey: encryptingKeyPair.publicKey,
    })
    console.log(didDocument)

    this.didstore.update({
      did,
      didDocument,
      signingKeyPair,
    })
    // this.didstore.set(did, didDocument)
    return didDocument
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
