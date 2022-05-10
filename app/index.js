import Debug from 'debug'
import Path from 'path'
import fs from 'fs/promises'
import ini from 'ini'

// import JlinxClient from 'jlinx-client'
// import JlinxServer from 'jlinx-server'
import KeyStore from 'jlinx-core/KeyStore.js'
import DidStore from 'jlinx-core/DidStore.js'
import {
  keyToString,
  keyToMultibase,
  fsExists,
  createSigningKeyPair,
} from 'jlinx-core/util.js'

import JlinxRemoteAgent from 'jlinx-server/JlinxRemoteAgent.js'
import JlinxAgent from 'jlinx-server/JlinxAgent.js'

const debug = Debug('jlinx:app')

export default class JlinxApp {

  constructor(opts = {}){
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`${this.constructor.name} requires 'storagePath'`)
    this.remote = opts.remote
    this.config = new Config(Path.join(this.storagePath, 'config.ini'))
    this.keys = new KeyStore(Path.join(this.storagePath, 'keys'))
    this.dids = new DidStore(Path.join(this.storagePath, 'dids'))
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + ')'
  }

  ready(){
    if (!this._ready) this._ready = (async () => {
      debug(`config: ${this.storagePath}`)
      if (!(await fsExists(this.storagePath))) await fs.mkdir(this.storagePath)
      await this.config.read()
      // try{
      //   this.config = await readConfig(this.configPath)
      // }catch(error){
      //   if (error.code === 'ENOENT'){
      //     debug('initializing config at', this.configPath)
      //     this.config = await initConfig(this.configPath)
      //   }else {
      //     throw error
      //   }
      // }

      this.agent = this.remote
        ? new JlinxRemoteAgent(this.remote)
        : new JlinxAgent({
          storagePath: this.storagePath,
          keys: this.keys,
          dids: this.dids,
        })

    })()
    return this._ready
  }

  destroy(){
    debug('DESTROUOING KLIXN APP', this)
    // if (this.agent && this.agent.destroy)
    this.agent.destroy()
  }

  async resolveDid(did){
    await this.ready()
    return this.agent.resolveDid(did)
  }

  async createDid(){
    const { did, secret } = await this.agent.createDid()
    await this.dids.track(did)
    debug({ did, secret })
    debug(`creating did=${did}`)
    const signingKeyPair = await this.keys.createSigningKeyPair()
    const encryptingKeyPair = await this.keys.createEncryptingKeyPair()
    const value = generateDidDocument({
      did,
      signingPublicKey: signingKeyPair.publicKey,
      encryptingPublicKey: encryptingKeyPair.publicKey,
    })
    debug(`updating did=${did}`, value)
    await this.agent.amendDid({did, secret, value})
    return await this.agent.resolveDid(did)
    // return value
  }

}






function generateDidDocument(opts){
  const {
    did,
    signingPublicKey,
    encryptingPublicKey,
  } = opts

  // TODO https://www.w3.org/TR/did-core/#did-document-metadata

  return {
    '@context': 'FAKE FOR NOW',
    id: did,
    created:  new Date().toISOString(),
    verificationMethod: [
      {
        id: `${did}#signing`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: keyToMultibase(signingPublicKey),
      },
    ],
    "keyAgreement": [
      {
        id: `${did}#encrypting`,
        type: 'X25519KeyAgreementKey2019',
        controller: did,
        publicKeyMultibase: keyToMultibase(encryptingPublicKey),
      },
    ],
    "authentication": [
      `${did}#signing`,
    ],
  }
}

const DEFAULT_SERVERS = [
  // {
  //   host: 'https://dids.jlinx.io',
  //   publicKey: `INSERT KEY HERE`,
  // },
]


class Config {
  constructor(path){
    this.path = path
  }

  // [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
  //   return this.constructor.name + '(' + opts.stylize({a:12}, 'object') + ')'
  // }

  async read(){
    debug('reading config at', this.path)
    try{
      const source = await fs.readFile(this.path, 'utf-8')
      this._value = ini.parse(source)
    }catch(error){
      if (error.code === 'ENOENT') await initConfig(this)
      else throw error
    }
  }

  async write(newValue){
    this._value = newValue
    await fs.writeFile(this.path, ini.stringify(this._value))
  }


  async init(){
    debug('initializing config at', this.path)
    await this.write({
      uuid: keyToString(createSigningKeyPair().publicKey),
      servers: [...DEFAULT_SERVERS],
    })
  }

  get value(){
    if (!this._value) throw new Error('config not ready yet')
    return this._value
  }

  get uuid(){ this.value().uuid }
}

