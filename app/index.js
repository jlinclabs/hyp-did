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
    this.configPath = Path.join(this.storagePath, 'config.ini')
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
      try{
        this.config = await readConfig(this.configPath)
      }catch(error){
        if (error.code === 'ENOENT'){
          debug('initializing config at', this.configPath)
          this.config = await initConfig(this.configPath)
        }else {
          throw error
        }
      }

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
    debug({ did, secret })
    const signingKeyPair = await this.keys.createSigningKeyPair()
    const encryptingKeyPair = await this.keys.createEncryptingKeyPair()
    const value = generateDidDocument({
      did,
      signingPublicKey: signingKeyPair.publicKey,
      encryptingPublicKey: encryptingKeyPair.publicKey,
    })
    await this.agent.updateDid({did, secret, value})
    // await this.agent.resolveDid(did)
    return value
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
