import Debug from 'debug'
import Path from 'path'
import fs from 'fs/promises'

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
    this.config = new Config(Path.join(this.storagePath, 'config.json'))
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
      const { uuid, servers } = await this.config.read()
      this.uuid = this.uuid
      this.servers = this.servers || []

      this.agent = this.remote // TODO maybe change agent depending on config
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

  async getServers(){
    const { servers } = await this.config.read()
    return servers || []
  }

  async addServer(server){
    if (!server.host) throw new Error(`host is required`)
    const servers = await this.getServers()
    servers.push(server)
    await this.config.patch({ servers })
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
  {
    host: 'https://dids.jlinx.io',
    // publicKey: '9rFz9zIvdUtM9bMQuqnnL0gKNNOSozfVtsvjT6mx88Q', // TODO replace with real public key
  },
]


class Config {
  constructor(path){
    this.path = path
  }

  async read(){
    debug('reading config at', this.path)
    try{
      const source = await fs.readFile(this.path, 'utf-8')
      this.value = JSON.parse(source)
    }catch(error){
      if (error.code === 'ENOENT') await this.init()
      else throw error
    }
    return this.value
  }

  async write(newValue){
    await fs.writeFile(this.path, JSON.stringify(newValue, null, 2))
    return this.value = newValue
  }

  async init(){
    debug('initializing config at', this.path)
    await this.write({
      uuid: keyToString(createSigningKeyPair().publicKey),
      servers: [...DEFAULT_SERVERS],
    })
  }

  async patch(patch){
    await this.read()
    await this.write({
      ...this.value,
      ...patch,
    })
  }
  // get value(){
  //   if (!this.value) throw new Error('config not ready yet')
  //   return this.value
  // }

  // get uuid(){ this.value.uuid }

  // get servers(){ this.value.servers || [] }
}

