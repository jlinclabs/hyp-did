import Path from 'path'
import { readdir, writeFile } from 'fs/promises'
import safetyCatch from 'safety-catch'
import { createKeyPair, keyToDid } from './util.js'

export default class Keychain {
  constructor(options = {}){
    const { storagePath } = options
    this.storagePath = storagePath
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + '  size: ' + opts.stylize(this.size, 'number') + '\n' +
      indent + '  open: ' + opts.stylize(!!this._opening.open, 'boolean') + '\n' +
      indent + ')'
  }

  async all(){
    try{
      const files = readdir(this.storagePath)
    }catch(error){
      if (error && error.code === 'ENOENT') return []
    }
    // if (this._opening) return this._opening
    // this._opening = readdir(this.storagePath)
    //   .then(files => {
    //     for (const file of files){
    //       console.log('identity file', file)
    //       this.map.add(file)
    //     }
    //     this._opening.open = true
    //   })
    //   .catch(error => {
    //     if (error && error.code === 'ENOENT'){
    //       this._opening.open = true
    //       return
    //     }
    //     console.error('error reading identities', error)
    //   })
    // this._opening.catch(safetyCatch)
    // return this._opening
  }

  async create(keyPair = createKeyPair()){
    console.log('creating new identity', keyPair)
    const did = keyToDid(keyPair.publicKey)
    const filePath = Path.join(this.storagePath, did)
    console.log({ did, filePath })
    await readFile(filePath)
    // await writeFile()
  }
}

