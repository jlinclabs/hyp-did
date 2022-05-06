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

  async update(opts){
    const {
      didDocument,
      signingKeyPair,
    } = opts
    const did = didDocument.id
    await this.set(did)
  }
}

