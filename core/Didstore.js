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

  _matchFilename(filename){ return isJlinxDid(filename) }


  async get(did){

  }

  async set(did, didDocument){

  }
  // // async init(){

  // // }

  // async _getCore(key, secretKey){
  //   const core = this.corestore.get({ key: keyToBuffer(key), secretKey })
  //   // await core.update()
  //   return core
  // }

  // async get(did, secretKey){
  //   // const publicKey = didToPublicKey(did)
  //   await this.ready()
  //   const core = await this._getCore(didToKey(did), secretKey)
  //   await core.update()
  //   const didDocument = new DidDocument(did, core)
  //   // await didDocument.update() // ??
  //   if (await didDocument.exists()) return didDocument
  // }

  // async create({ didKeyPair, signingKeyPair, encryptingKeyPair }){
  //   // await this.ready()
  //   // const didSigningKeyPair = createKeyPair() // when do we do this if its doable on another machine?
  //   // const hypercoreKeyPair = createSigningKeyPair()
  //   const did = keyToDid(didKeyPair.publicKey)
  //   const core = await this._getCore(didKeyPair.publicKey, didKeyPair.secretKey)
  //   const didDocument = new DidDocument(did, core)
  //   await didDocument.create()
  //   return didDocument
  // }

}

