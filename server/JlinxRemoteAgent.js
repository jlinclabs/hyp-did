import { createSigningKeyPair, keyToBuffer, keyToDid, didToKey } from 'jlinx-core/util.js'


export default class JlinxRemoteAgent {

  constructor(url, opts = {}){
    this.url = url
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  url: ' + opts.stylize(this.url, 'string') + '\n' +
      // indent + '  cores: ' + opts.stylize(this.corestore.cores.size, 'number') + '\n' +
      // indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

}

