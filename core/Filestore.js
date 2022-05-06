import Path from 'path'
import { mkdir, chown, readdir, readFile, writeFile } from 'fs/promises'
import safetyCatch from 'safety-catch'
import b4a from 'b4a'

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

  async _get(filename){
    const path = this.path(filename)
    return await readFile(path) // TODO handle missing dir error here
  }

  async _set(filename, value){
    const path = this.path(filename)
    await mkdir(this.storagePath).catch(safetyCatch)
    await writeFile(path, value)
  }

  _matchFilename(files){ return [...files] }

  async all(){
    let files
    try{
      files = await readdir(this.storagePath)
    }catch(error){
      if (error && error.code === 'ENOENT') return []
      throw error
    }
    files = files.filter(filename => this._matchFilename(filename))
    const all = []
    await Promise.all(
      files.map(async filename => {
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
