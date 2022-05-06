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

  constructor({ storagePath, keystore, corestore }){
    super({ storagePath })
    this.keystore = keystore
    this.corestore = corestore
  }

  _matchFilename(filename){ return isJlinxDid(filename) }

  async get(did){
    // const did = await this._get(did)
    // if ()
    return did
  }

  async set(did){
    console.log({ did })
    // const json = JSON.stringify(didDocument)
    await this._set(did, did)
  }

  async createKeypair(){
    const keyPair = await this.keystore.createSigningKeyPair()
    console.log('created new signign keypair for new did', keyPair)
    return keyToDid(keyPair.publicKey)
  }

  async _getCore(did){
    const publicKey = didToKey(did)
    console.log('???', {did, publicKey})
    const keyPair = await this.keystore.get(publicKey)
    console.log('_getCore keyPair', keyPair)
    let secretKey
    if (keyPair && keyPair.type === 'signing'){
      secretKey = keyPair.secretKey
    }else{
      throw new Error(`unable to find private key for ${did}`)
    }

    const core = this.corestore.get({ key: keyToBuffer(publicKey), secretKey })
    await core.update()
    console.log('CORE!', core)
    return core
  }

  async update(opts){
    const {
      didDocument,
      signingKeyPair,
    } = opts
    const did = didDocument.id
    await this.set(did)
    // const publicKey = didToKey(did)
    const core = await this._getCore(did)
    await core.append(JSON.stringify(didDocument))
    console.log('CORE2!', core)

  }
}

// class DidDocument {

// }
