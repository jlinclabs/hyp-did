import Path from 'path'
import fs from 'fs/promises'
import safetyCatch from 'safety-catch'
import b4a from 'b4a'
import { fsExists } from './util.js'

/*
 * creates and stores private keys but never gives you then
 * right now we just write them to disk but in the future
 * we want to use OS specific more-secure solutions like
 * apple's keychain
 */

export default class Filestore {
  constructor(storagePath){
    this.storagePath = storagePath
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      // indent + '  size: ' + opts.stylize(this.size, 'number') + '\n' +
      // indent + '  open: ' + opts.stylize(!!this._opening.open, 'boolean') + '\n' +
      indent + ')'
  }

  path(filename){
    return Path.join(this.storagePath, filename)
  }

  async has(filename){
    return this._matchFilename(filename) && await fsExists(this.path(filename))
  }

  _serialize(value){
    return value
  }

  _deserialize(value){
    return value
  }

  _matchFilename(filename){ return true }

  async _get(filename){
    if (!this._matchFilename(filename)) return
    const path = this.path(filename)
    let value
    try{
      value = await fs.readFile(path)
    }catch(error){
      if (error && error.code === 'ENOENT') return
      throw error
    }
    return this._deserialize(value)
  }

  async get(did){
    await this._get(did)
  }

  async _set(filename, value){
    const path = this.path(filename)
    await fs.mkdir(this.storagePath).catch(safetyCatch)
    await fs.writeFile(path, this._serialize(value))
  }

  async set(did, value){
    await this._set(did, value)
  }

  async _delete(filename){
    const path = this.path(filename)
    try{
      await fs.unlink(path)
    }catch(error){
      if (error && error.code === 'ENOENT') return
      throw error
    }
  }

  async delete(did){
    await this._delete(did)
  }

  async keys(){
    let filenames
    try{
      filenames = await fs.readdir(this.storagePath)
    }catch(error){
      if (error && error.code === 'ENOENT') return []
      throw error
    }
    return filenames.filter(filename => this._matchFilename(filename))
  }

  async all(){
    const filenames = await this.keys()
    const all = []
    await Promise.all(
      filenames.map(async filename => {
        const value = await this.get(filename)
        if (value) all.push(value)
      })
    )
    return all
  }


}

class KeyPair {
  constructor({ publicKey, secretKey }){
    this.publicKey = publicKey
    this.secretKey = secretKey
    this.valid = this.validate(secretKey)
  }
  get publicKeyAsString(){ return keyToString(this.publicKey) }
  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    return this.constructor.name + '(' +
      opts.stylize(this.publicKeyAsString, 'string') +
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

