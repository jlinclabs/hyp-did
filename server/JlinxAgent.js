import Debug from 'debug'
import { createRandomString, keyToDid, didToKey } from 'jlinx-core/util.js'
import HypercoreClient from './HypercoreClient.js'
import Ledger from './Ledger.js'

const debug = Debug('jlinx:agent')

// AKA LocalJlinxServer
// AKA JlinxHypercoreClient
export default class JlinxAgent {

  constructor(opts){
    this.agentId
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`${this.constructor.name} requires 'storagePath'`)
    this.keys = opts.keys || new KeyStore(Path.join(this.storagePath, 'keys'))
    this.dids = opts.dids || new DidStore(Path.join(this.storagePath, 'dids'))

    // this.seed = dht.hash(Buffer.from(this.storagePath)) // TODO add more uniqueness here

    this.hypercore = new HypercoreClient({
      storagePath: this.storagePath,
    })
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      // indent + '  cores: ' + opts.stylize(this.corestore.cores.size, 'number') + '\n' +
      // indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + ')'
  }

  async ready(){
    await this.hypercore.ready()
  }

  async destroy(){
    this.hypercore.destroy()
  }

  async getLedger(did){
    const publicKey = didToKey(did)
    const keyPair = await this.keys.get(publicKey)
    const secretKey = keyPair && keyPair.type === 'signing'
      ? keyPair.secretKey : undefined
    const core = await this.hypercore.getCore(publicKey, secretKey)
    const ledger = new Ledger(did, core)
    await ledger.ready()
    return ledger
  }

  async resolveDid(did){
    await this.ready()
    const didDocument = await this.getLedger(did)
    debug('resolveDid', { did, didDocument })
    await didDocument.ready()
    debug('resolveDid', { did, didDocument })
    // const entries = await didDocument.getEntries()
    const value = await didDocument.getValue()
    debug('resolveDid', { did, value })
    return value
    // if (!(await didDocument.exists())) return didDocument.value
  }

  async createDid(){
    const { publicKey } = await this.keys.createSigningKeyPair()
    const did = keyToDid(publicKey)
    debug(`creating did=${did}`)
    const didDocument = await this.getLedger(did)
    const secret = createRandomString(32)
    await didDocument.initialize({
      type: 'jlinx-did-document-v1',
      secret,
    })
    debug('created did', { did, didDocument, secret })
    return { did, secret }
  }

  async amendDid({did, secret, value}){
    debug('amendDid', { did, secret, value })
    const didDocument = await this.getLedger(did)
    debug('amendDid', { didDocument })
    const before = await didDocument.getValue()
    await didDocument.setValue(value)
    const after = await didDocument.getValue()
    debug('amended did', { did, before, after })
    return after
  }

}


// async function isDidCore(core){
//   try{
//     await core.update()
//     if (core.length === 0) {
//       debug('isDidCore empty')
//       return false
//     }
//     let header = await core.get(0)
//     header = JSON.parse(header)
//     debug({ header })
//     return header.jlinx && header.type.startsWith('jlinx-did-document-')
//   }catch(error){
//     debug('isDidCore error', error)
//     return false
//   }
// }
