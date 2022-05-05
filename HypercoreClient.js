import Path from 'path'
import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import dht from '@hyperswarm/dht'
import { keyToString, keyToBuffer, keyToDid } from './util.js'
import topic from './topic.js'

export default class HypercoreClient {
  constructor(options = {}){
    const { storagePath } = options
    this.storagePath = storagePath
    this.seed = dht.hash(Buffer.from(this.storagePath)) // TODO add more uniqueness here
    this.corestore = new Corestore(this.storagePath)
  }

  async connect(){
    if (this._ready) return
    this.swarm = new Hyperswarm({
      seed: this.seed,
      // bootstrap: [
      //   { host: '127.0.0.1', port: 49736 },
      // ]
    })
    this.swarmKey = keyToString(this.swarm.keyPair.publicKey)

    console.log(`[Hyperlinc] connecting to swarm as`, this.swarmKey)

    process.on('SIGTERM', () => { this.destroy() })

    this.swarm.on('connection', (conn) => {
      console.log(
        '[Hyperlinc] new peer connection from',
        keyToString(conn.remotePublicKey)
      )
      // Is this what we want?
      this.corestore.replicate(conn, {
        keepAlive: true,
        // live?
      })
    })

    console.log(`joining topic: "${topic}"`)
    this.discovery = this.swarm.join(topic)

    console.log('flushing discovery…')
    this._ready = this.discovery.flushed().then(async () => {
      console.log('flushed!')
      console.log('connected?', this.swarm.connections.size)
      if (this.swarm.connections.size > 0) return
      await this.swarm.flush() // Waits for the swarm to connect to pending peers.
      console.log(`connected to ${this.swarm.connections.size} peers :D`)
    })
    // console.log('.listed')
    // await this.swarm.listen()
    // console.log('listening…')
  }

  async ready(){
    if (!this._ready) await this.connect()
    await this._ready
  }

  async destroy(){
    // console.log('[Hyperlinc] destroying!')
    if (this.swarm){
      console.log('[Hyperlinc] disconnecting from swarm')
      console.log('[Hyperlinc] connections.size', this.swarm.connections.size)
      console.log('[Hyperlinc] swarm.flush()')
      await this.swarm.flush()
      console.log('[Hyperlinc] flushed!')
      console.log('[Hyperlinc] connections.size', this.swarm.connections.size)
      // await this.swarm.clear()
      console.log('[Hyperlinc] swarm.destroy()')
      await this.swarm.destroy()
      console.log('[Hyperlinc] swarm destroyed. disconnected?')
      console.log('[Hyperlinc] connections.size', this.swarm.connections.size)
      for (const conn of this.swarm.connections){
        console.log('disconnecting dangling connection')
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
}
