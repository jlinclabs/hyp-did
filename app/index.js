import JlinxClient from 'jlinx-client'
import JlinxServer from 'jlinx-server'
import KeyStore from 'jlinx-core/KeyStore.js'
import DidStore from 'jlinx-core/DidStore.js'

export default class JlinxApp {

  constructor(opts = {}){
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`${this.constructor.name} requires 'storagePath'`)
    this.keys = new KeyStore(Path.join(this.storagePath, 'keys'))
    this.dids = new DidStore(Path.join(this.storagePath, 'dids'))
    // this.client = new JlinxClient({
    //   storagePath: this.storagePath,
    // })

    // this.localServer = new JlinxServer({

    // })
  }

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  storagePath: ' + opts.stylize(this.storagePath, 'string') + '\n' +
      indent + ')'
  }

  ready(){
    if (!this._ready) this._ready = (async () => {
      debug(`config: ${this.storagePath}`)
      if (!(await fsExists(this.storagePath))) await fs.mkdir(this.storagePath)
      try{
        this.config = await readConfig(this.configPath)
      }catch(error){
        if (error.code === 'ENOENT')
          this.config = await initConfig(this.configPath)
        else throw error
      }
    })()
    return this._ready
  }

  async resolveDid(did){
    await this.ready()
    return this.client.resolveDid(did)
  }

  async createDid(){
    await this.ready()
    const { did, secret } = this.client.createDid()
    this.dids.add(did)
    const value = {}
    this.client.updateDid(did, value)
  }

}


async function readConfig(path){
  debug('reading config at', path)
  const source = await fs.readFile(path, 'utf-8')
  return ini.parse(source)
}

async function initConfig(path){
  debug('initializing config at', path)
  const config = {
    uuid: keyToString(createSigningKeyPair().publicKey),
  }
  debug('writing config', config)
  await fs.writeFile(path, ini.stringify(config))
  return config
}
