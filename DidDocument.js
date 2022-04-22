
import { keyToString, didToKey } from './util.js'

export default class DidDocument {
  constructor(did, core){
    this.did = did
    this.publicKey = didToKey(did)
    this.core = core
    console.log(this)
  }

  get writable(){ return this.core.writable }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  did: ' + opts.stylize(this.did, 'string') + '\n' +
      indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + '  publicKey: ' + opts.stylize(this.publicKey, 'string') + '\n' +
      indent + ')'
  }

  async update(){
    // await this.ready()
    console.log('CORE!', this.core)
    await this.core.update()
    console.log('CORE!', this.core)
    if (keyToString(this.core.key) !== this.publicKey)
      throw new Error(`key mismatch ${[keyToString(this.core.key), this.publicKey]}`)
    this._ready = true
    const json = await this.core.get(this.core.length - 1)
    this._value = JSON.parse(json)
  }

  get value(){
    if (this._ready) return this._value
    throw new Error(`cannot get value before ready`)
  }

  async exists(){
    await this.update()
    return this.core.length > 0
  }



  async create(){
    await this.update()
    // write to it
    // ¿ ensure it was replicated to a permanode ?
      // we could curl a did-server and invoke their caching of it
  }


  async _append(newValue){
    newValue = { ...newValue, updatedAt: new Date }
    const json = JSON.stringify(newValue)
    return await this.core.append([json])
  }

}
