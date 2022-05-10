import Debug from 'debug'
import Path from 'path'
import fs from 'fs/promises'
import { URL } from 'node:url'

import fetch from 'node-fetch'
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

const DEFAULT_SERVERS = [
  {
    host: 'https://dids.jlinx.io',
    // publicKey: '9rFz9zIvdUtM9bMQuqnnL0gKNNOSozfVtsvjT6mx88Q', // TODO replace with real public key
  },
]

export default class JlinxApp {

  constructor(opts = {}){
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`${this.constructor.name} requires 'storagePath'`)
    this.remote = opts.remote /// <--- ???? :/
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
      if (await this.config.exists()){
        await this.config.read()
      }else{
        debug('initializing jlinx storage at', this.config.path)
        const keyPair = await this.keys.createSigningKeyPair()
        await this.config.write({
          agentPublicKey: keyPair.publicKeyAsString,
          servers: [...DEFAULT_SERVERS],
        })
      }
      // const { agentPublicKey, servers } = this.config.value

      this.agent = this.remote // TODO maybe change agent depending on config
        ? new JlinxRemoteAgent(this.remote)
        : new JlinxAgent({
          publicKey: this.config.value.agentPublicKey,
          storagePath: this.storagePath,
          keys: this.keys,
          dids: this.dids,
        })

      await this.agent.ready()
    })()
    return this._ready
  }

  async destroy(){
    debug('DESTROUOING KLIXN APP', this)
    // if (this.agent && this.agent.destroy)
    if (this.agent) await this.agent.destroy()
  }

  async resolveDid(did){
    await this.ready()
    return this.agent.resolveDid(did)
  }

  async createDid(){
    await this.ready()
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

  async getDidReplicationUrls(did){
    await this.ready()
    const servers = await this.config.getServers()
    debug('!!!!!!!!servers', servers)
    return servers.map(server => `${server.host}/${did}`)
  }

  async replicateDid(did){
    const servers = await this.getDidReplicationUrls(did)
    if (servers.length === 0)
      throw new Error(`unable to replicate. no servers listed in config ${this.config.path}`)
    await Promise.all(
      servers.map(url => replicateDid(did, url))
    )
  }
}


async function replicateDid(did, url){
  // const url = `${server.host}/${did}`
  debug(`replicating did=${did} at ${url}`)
  debug(`GET ${url}`)
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })
  debug({ response })
  if (!response.ok){
    debug('replication failed', url)
    return false
  }
  const didDocument = await response.json()
  debug('replication successful', didDocument)
  return didDocument
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


class Config {
  constructor(path){
    this.path = path
  }

  async exists(){
    return await fsExists(this.path)
  }

  async read(){
    console.trace()
    debug('reading config at', this.path)
    const source = await fs.readFile(this.path, 'utf-8')
    this.value = JSON.parse(source)
    return this.value
  }

  async write(newValue){
    await fs.writeFile(this.path, JSON.stringify(newValue, null, 2))
    return this.value = newValue
  }

  async patch(patch){
    await this.read()
    await this.write({
      ...this.value,
      ...patch,
    })
  }

  async getServers(){
    const { servers } = await this.read()
    return servers || []
  }

  async setServers(servers){
    await this.patch({ servers })
  }

  async addServer(server){
    if (!server.host) throw new Error(`host is required`)
    const servers = await this.getServers()
    await this.setServers([...servers, server])
  }

  async removeServer(host){
    if (!host) throw new Error(`host is required`)
    const servers = await this.getServers()
    await this.setServers(
      servers.filter(server => server.host !== host)
    )
  }

}

