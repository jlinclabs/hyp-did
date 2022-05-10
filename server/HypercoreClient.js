import Debug from 'debug'
import Path from 'path'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import dht from '@hyperswarm/dht'
import { keyToString, keyToBuffer, keyToDid } from 'jlinx-core/util.js'
import topic from 'jlinx-core/topic.js'

const debug = Debug('jlinx:hypercore')

export default class HypercoreClient {
  constructor(opts = {}){
    console.trace('new HypercoreClient', opts)
    this.keyPair = opts.keyPair
    if (!this.keyPair) throw new Error(`${this.constructor.name} requires 'keyPair'`)
    this.storagePath = opts.storagePath
    if (!this.storagePath) throw new Error(`${this.constructor.name} requires 'storagePath'`)
    this.seed = dht.hash(Buffer.from(this.storagePath)) // TODO add more uniqueness here
    this.corestore = new Corestore(this.storagePath)
  }

  async connect(){
    if (this.destroyed) {
      console.trace(`ALREADY DESTROYED`)
      throw new Error(`ALREADY DESTROYED`)
    }

    if (this._ready) {
      console.trace(`HypercoreClient#connect already connected :/`)
      return await this._ready
    }
    debug(`HypercoreClient connecting to hyperswarm`)
    this.swarm = new Hyperswarm({
      keyPair: this.keyPair,
      // seed: this.seed,
      // bootstrap: [
      //   { host: '127.0.0.1', port: 49736 },
      // ]
    })
    this.swarmKey = keyToString(this.swarm.keyPair.publicKey)

    debug(`connecting to swarm as`, this.swarmKey)

    process.on('SIGTERM', () => { this.destroy() })

    this.swarm.on('connection', (conn) => {
      debug(
        'new peer connection from',
        keyToString(conn.remotePublicKey)
      )
      // Is this what we want?
      this.corestore.replicate(conn, {
        keepAlive: true,
        // live?
      })
    })

    debug(`joining topic: "${topic}"`)
    this.discovery = this.swarm.join(topic)

    debug('flushing discovery…')
    this._ready = this.discovery.flushed().then(async () => {
      if (this.destroyed) {
        debug('discovery flushed after destroy. aborting')
        return
      }
      debug('discovery flushed!')
      debug('connected?', this.swarm.connections.size)
      if (this.swarm.connections.size === 0){
        await this.swarm.flush() // Waits for the swarm to connect to pending peers.
      }
      debug(`connected to ${this.swarm.connections.size} peers :D`)
      debug(`HYPERCORE CLIENT READY!`)
      this._connected = true
    })
    // debug('.listed')
    // await this.swarm.listen()
    // debug('listening…')
  }

  async ready(){
    if (!this._ready) await this.connect()
    await this._ready
  }

  async destroy(){
    debug('destroying!')
    this.destroyed = true
    if (this.swarm){
      debug('disconnecting from swarm')
      // debug('connections.size', this.swarm.connections.size)
      // debug('swarm.flush()')
      await this.swarm.flush()
      // debug('flushed!')
      // debug('connections.size', this.swarm.connections.size)
      // // await this.swarm.clear()
      // debug('swarm.destroy()')
      await this.swarm.destroy()
      // debug('swarm destroyed. disconnected?')
      // debug('connections.size', this.swarm.connections.size)
      for (const conn of this.swarm.connections){
        debug('disconnecting dangling connection')
        conn.destroy()
      }
    }
  }

  async status(){
    const keys = [...this.corestore.cores.keys()]
    return {
      numberOfPeers: this.swarm.peers.size,
      connected: this.swarm.peers.size > 0,
      numberOfCores: this.corestore.cores.size,
      cores: keys.map(key => {
        const core = this.corestore.cores.get(key)
        return {
          key: keyToString(core.key),
          length: core.length,
        }
      }),
    }
  }

  async getCore(key, secretKey){
    const core = this.corestore.get({ key: keyToBuffer(key), secretKey })
    // await core.update()
    return core
  }
}
