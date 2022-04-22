
// import { inspect } from 'util.js'
import HypercoreClient from './HypercoreClient.js'
import { keyToString, keyToBuffer, keyToDid, didToKey } from './util.js'

// TODO change this to a derivation of "hyp-did"
const TOPIC_KEY = keyToBuffer('604d03ea2045c1adfcb6adad02d71667e03c27ec846fe4f5c4d912c10464aea0')

export default class HypDid extends HypercoreClient {
  async create(){
    await this.ready()
    let { publicKey, secretKey } = crypto.keyPair()
    const did = keyToDid(publicKey)
    const didDocument = new DidDocument(this, did, secretKey)
    await didDocument.create()
    return didDocument
  }

  async get(did, secretKey){
    // const publicKey = didToPublicKey(did)
    const core = this.corestore.get({
      key: didToKey(did),
      secretKey,
    })
    const didDocument = new DidDocument(core)
    if (await didDocument.exists()) return didDocument
  }
}
