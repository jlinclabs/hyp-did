import { mkdir, chown, readdir, readFile, writeFile } from 'fs/promises'

import Filestore from './Filestore.js'
import HypercoreClient from './HypercoreClient.js'
import {
  isJlinxDid,
  createSigningKeyPair,
  keyToBuffer,
  keyToDid,
  didToKey,
} from './util.js'
import DidDocument from './DidDocument.js'


export default class Didstore extends Filestore {

  constructor({ storagePath }){
    super({ storagePath })
  }

  _matchFilename(filename){ return isJlinxDid(filename) }

  async get(did){
    if (
      !isJlinxDid(did) ||
      !(await this.has(did))
    ) return
    const publicKey = didToKey(did)
    const core = await this._getCore(did)
    const didDocument = new DidDocument({ did, core })
    return didDocument
  }

  async set(did){
    await this._set(did, did)
  }

  async create(){
    // in the remove client this would be an HTTP post
    const keyPair = await this.keystore.createSigningKeyPair()
    const did = keyToDid(keyPair.publicKey)
    await this.set(did)
    return await this.get(did)
  }

  async _getCore(did){
    const publicKey = didToKey(did)
    const keyPair = await this.keystore.get(publicKey)
    let secretKey
    if (keyPair && keyPair.type === 'signing'){
      secretKey = keyPair.secretKey
    }else{
      throw new Error(`unable to find private key for ${did}`)
    }
    const core = this.corestore.get({ key: keyToBuffer(publicKey), secretKey })
    await core.update()
    return core
  }

}
