
import { keyToDid } from './util.js'

export default class DidDocument {
  constructor(core){
    this.did = did
    this.publicKey = didToKey(did)
    this.core = core
    this.writable = this.core.writable
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  id: ' + opts.stylize(this.id, 'string') + '\n' +
      indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

  async update(){
    await this.ready()
    await this.core.update()
  }

  async exists(){
    // TODO maybe try/catch timeout?
    // await this.update()
    // return !!this.               xvalue
  }

  async create(){

  }
}
