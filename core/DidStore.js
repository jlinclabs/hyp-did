import HypercoreClient from './HypercoreClient.js'
import { createSigningKeyPair, keyToBuffer, keyToDid, didToKey } from './util.js'
import DidDocument from './DidDocument.js'

export default class DidStore {

  constructor(options = {}){
    const { storagePath } = options
    super({ storagePath })
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + '  size: ' + opts.stylize(this.size, 'number') + '\n' +
      // indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

  async _getCore(key, secretKey){
    const core = this.corestore.get({ key: keyToBuffer(key), secretKey })
    // await core.update()
    return core
  }

  async get(did, secretKey){
    // const publicKey = didToPublicKey(did)
    await this.ready()
    const core = await this._getCore(didToKey(did), secretKey)
    await core.update()
    const didDocument = new DidDocument(did, core)
    // await didDocument.update() // ??
    if (await didDocument.exists()) return didDocument
  }

  async create({ didKeyPair, signingKeyPair, encryptingKeyPair }){
    // await this.ready()
    // const didSigningKeyPair = createKeyPair() // when do we do this if its doable on another machine?
    // const hypercoreKeyPair = createSigningKeyPair()
    const did = keyToDid(didKeyPair.publicKey)
    const core = await this._getCore(didKeyPair.publicKey, didKeyPair.secretKey)
    const didDocument = new DidDocument(did, core)
    await didDocument.create()
    return didDocument
  }

}

