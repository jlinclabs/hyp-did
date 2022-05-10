import Path from 'path'
import ini from 'ini'
import fs from 'fs/promises'

import Debug from 'debug'
const debug = Debug('jlinx:client')
// import Didstore from './Didstore.js'
// import JlinxServer from 'jlinx-server'
import KeyStore from 'jlinx-core/KeyStore.js'
// import DidDocument from './DidDocument.js'
import { keyToString, createSigningKeyPair, fsExists, } from 'jlinx-core/util.js'

/*
 * ~/.jlinx
 * ~/.jlinx/config
 * ~/.jlinx/cores
 * ~/.jlinx/dids
 * ~/.jlinx/dids/${did} (containts did document)
 * ~/.jlinx/keys/${publicKeyAsUrlSafeMd5} (contains private key)
 *
 * new JlinxClient()
 * new JlinxClient({
 *   storagePath: '/somewhere/else',
 *   server: new JlinxRemoteServer({
 *      url: 'https://dids.jlinx.io',
 *   })
 * })
 */
export default class JlinxClient {

  // static get defaultStoragePath(){
  //   return Path.join(os.homedir(), '.jlinx')
  // }

  constructor(opts){
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`JlinxClient requires a server`)

    this.configPath = Path.join(this.storagePath, 'config.ini')

    // used to store crypto keys locally
    this.keyStore = new KeyStore({
      storagePath: Path.join(this.storagePath, 'keys')
    })

    // instead of taking a server make one for each action?


    this.servers = [
      RemoteJlinxServer({ url: 'http://jlinx.io' })
    ]
    // this.server = opts.server
    // if (!this.server) throw new Error(`JlinxClient requires a server`)


    //   opts.server ||
    //   // TODO check config.ini for server options
    //   new JlinxHttpServer({
    //     url: 'https://jlinx.io',
    //     // storagePath: this.storagePath,
    //     // keyStore: this.keyStore,
    //   })
    // )
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

  async resolveDid(did){
    // await this.ready()

    // we could resolve the did via
    // A) hyperswarm directly
    // B) N http jlinx servers

    const results = await Promise.all(
      this.servers.map(server =>
        server.resolveDid(did)
      )
    )
    console.log(results)
    return await this.server.resolveDid(did)
  }

  async createDid(){
    const { did } = await this.server.createDid()
    console.log({ did })
    const signingKeyPair = await this.keyStore.createSigningKeyPair()
    const encryptingKeyPair = await this.keyStore.createEncryptingKeyPair()
    const value = generateDidDocument({
      did,
      signingPublicKey: signingKeyPair.publicKey,
      encryptingPublicKey: encryptingKeyPair.publicKey,
    })
    await this.server.updateDid(did, value)
    console.log({ did, value })
    const didDocument = await this.server.resolveDid(didDocument.did)
    return didDocument
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
    '@context': this.contextUrl,
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
