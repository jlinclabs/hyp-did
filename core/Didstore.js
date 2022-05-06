import Path from 'path'
import Corestore from 'corestore'
import Debug from 'debug'
const debug = Debug('jlinx:didstore')

import Filestore from './Filestore.js'
import {
  isJlinxDid,
  keyToBuffer,
  keyToDid,
  didToKey,
} from './util.js'
import DidDocument from './DidDocument.js'


// MAYEB!?!?!

// this class can handle manipulating dids that are stored locally
// and
/*

  all dids on disk are "tracked"
  they can point to localhost or a did server


  if we want each did to point to an authoritative server
  then we cant support the case where a desktop app
  anonymously joins a swarm to sync their did. or can we?




  what if we make a local service that we spawn or can be darmonized
  that mirrors the remote http did server
  and this class never sees a keystore it only talks to a "remove"
  did server, and we just start one locally

  the cli could later manage a daemon that persists your cores
  full time
*/

export default class Didstore extends Filestore {

  constructor({ storagePath, keystore, corestore }){
    const path = (...parts) => Path.join(storagePath, ...parts)
    super({ storagePath: path('dids') })
    this.corestore = new Corestore(path('cores'))
    this.keystore = keystore
  }

  _matchFilename(filename){ return isJlinxDid(filename) }

  async get(did){
    if (
      !isJlinxDid(did) ||
      !(await this.has(did))
    ) return

    // here we would read the local did file
    // and use its content to determine if
    // have a hyperswarm connection or not
    // and fallback to a REST api server?


    const publicKey = didToKey(did)
    const core = await this._getCore(did)
    const didDocument = new DidDocument({ did, core })
    debug('GET', did, didDocument)
    return didDocument
  }

  async set(did){
    await this._set(did, did)
  }

  async create(){
    debug('creating new did')
    // in the remove client this would be an HTTP post
    const keyPair = await this.keystore.createSigningKeyPair()
    const did = keyToDid(keyPair.publicKey)
    await this.set(did)
    debug('create new did', did)
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
