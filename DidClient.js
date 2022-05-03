
import { keyPair } from 'hypercore-crypto'
import HypercoreClient from './HypercoreClient.js'
import { keyToString, keyToBuffer, keyToDid, didToKey } from './util.js'
import DidDocument from './DidDocument.js'

// TODO change this to a derivation of "hyp-did"
const TOPIC_KEY = keyToBuffer('604d03ea2045c1adfcb6adad02d71667e03c27ec846fe4f5c4d912c10464aea0')

export default class DidClient extends HypercoreClient {

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + '  cores: ' + opts.stylize(this.corestore.cores.size, 'number') + '\n' +
      // indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

  async create(){
    // await this.ready()
    let { publicKey, secretKey } = keyPair()
    const core = await this._getCore(publicKey, secretKey)
    const didDocument = new DidDocument(keyToDid(publicKey), core)
    await didDocument.create()
    return didDocument
  }

  async _getCore(key, secretKey){
    console.log('[didClient]._getCore', {key})
    const core = this.corestore.get({ key: keyToBuffer(key), secretKey })
    await core.update()
    console.log('[didClient]._getCore', core)
    return core
  }

  async get(did, secretKey){
    // const publicKey = didToPublicKey(did)
    await this.ready()
    console.log('[didClient].get', {
      did,
      key: didToKey(did),
      keyAsHex: keyToBuffer(didToKey(did)).toString('hex'),
      didFromKey: keyToDid(didToKey(did))
    })
    const core = await this._getCore(didToKey(did), secretKey)
    await core.update()
    console.log('[didClient].get', {core})
    const didDocument = new DidDocument(did, core)
    console.log('[didClient].get', { didDocument })
    if (await didDocument.exists()) return didDocument
  }
}

export { keyPair }
