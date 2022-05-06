import Path from 'path'
import { mkdir, chown, readdir, readFile, writeFile } from 'fs/promises'
import safetyCatch from 'safety-catch'
import b64 from 'urlsafe-base64'
import b4a from 'b4a'

import Filestore from './Filestore.js'

import {
  isPublicKey,
  keyToBuffer,
  keyToString,
  createSigningKeyPair,
  createEncryptingKeyPair,
  validateSigningKeyPair,
  validateEncryptingKeyPair,
} from './util.js'

/*
 * creates and stores private keys but never gives you then
 * right now we just write them to disk but in the future
 * we want to use OS specific more-secure solutions like
 * apple's keychain
 */

export default class Keystore extends Filestore {

  _matchFilename(filename){ return isPublicKey(filename) }

  async get(publicKey){
    const secretKey = await this._get(publicKey)
    const keypair = (
      secretKey.length === 32
        ? new EncryptingKeyPair({ publicKey, secretKey }) :
      secretKey.length === 64
        ? new SigningKeyPair({ publicKey, secretKey }) :
      undefined
    )
    if (keypair && keypair.valid) return keypair
  }

  async set(keyPair){
    // TODO validate keypair
    // TODO prevent overwriting
    const publicKey = keyToString(keyPair.publicKey)
    await this._set(publicKey, keyPair.secretKey)
    const keyPair2 = await this.get(publicKey)

    // const path = this.path(keyPair.publicKey)
    // await mkdir(this.storagePath).catch(safetyCatch)
    // // TODO validateSigningKeyPair || validateEncryptingKeyPair
    // await writeFile(path, keyPair.secretKey)
    if (!b4a.equals(await this._get(publicKey), keyPair.secretKey))
      throw new Error('failed to write key')
  }

  async createSigningKeyPair(){
    const keyPair = SigningKeyPair.create()
    await this.write(keyPair)
    return keyPair
  }

  async createEncryptingKeyPair(){
    const keyPair = EncryptingKeyPair.create()
    await this.write(keyPair)
    return keyPair
  }

  async all(){
    try{
      const files = await readdir(this.storagePath)
      const all = []
      await Promise.all(
        files.map(async filename => {
          if (!isPublicKey(filename)) return
          const keyPair = await this.get(filename)
          if (keyPair) all.push(keyPair)
        })
      )
      return all
    }catch(error){
      if (error && error.code === 'ENOENT') return []
      throw error
    }
  }
}

class KeyPair {
  constructor({ publicKey, secretKey }){
    this.publicKey = keyToBuffer(publicKey)
    this.secretKey = keyToBuffer(secretKey)
    this.id = keyToString(publicKey)
    this.valid = this.validate(secretKey)
  }
  // get publicKeyAsString(){ return keyToString(this.publicKey) }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    return this.constructor.name + '(' +
      opts.stylize(this.id, 'string') +
      (this.valid ? '' : ' ' + opts.stylize('invalid', 'boolean')) +
    ')'
  }
}

class SigningKeyPair extends KeyPair {
  static create(){
    return new SigningKeyPair(createSigningKeyPair())
  }

  get type(){ return 'signing' }

  validate(secretKey){
    const { publicKey } = this
    return validateSigningKeyPair({ publicKey, secretKey })
  }
  sign(){

  }
  validateSignature(){

  }
}

class EncryptingKeyPair extends KeyPair {
  static create(){
    return new EncryptingKeyPair(createEncryptingKeyPair())
  }

  get type(){ return 'encrypting' }

  validate(secretKey){
    const { publicKey } = this
    return validateEncryptingKeyPair({ publicKey, secretKey })
  }
  encrypt(secretKey){

  }
  decrypt(secretKey){

  }

}
