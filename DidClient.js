
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
      indent + '  id: ' + opts.stylize(this.id, 'string') + '\n' +
      indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

  async create(){
    await this.ready()
    let { publicKey, secretKey } = keyPair()
    const core = await this._getCore(publicKey, secretKey)
    const didDocument = new DidDocument(keyToDid(publicKey), core)
    await didDocument.create()
    return didDocument
  }

  async _getCore(key, secretKey){
    return await this.corestore.get({ key, secretKey })
  }

  async get(did, secretKey){
    // const publicKey = didToPublicKey(did)
    const core = await this._getCore(didToKey(did), secretKey)
    const didDocument = new DidDocument(did, core)
    if (await didDocument.exists()) return didDocument
  }
}

export { keyPair }
