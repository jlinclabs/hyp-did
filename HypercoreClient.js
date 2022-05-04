import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import dht from '@hyperswarm/dht'
import { keyToString, keyToBuffer, keyToDid } from './util.js'
import topic from './topic.js'

// TODO change this to a derivation of "hyp-did"
// const TOPIC_KEY = keyToBuffer('604d03ea2045c1adfcb6adad02d71667e03c27ec846fe4f5c4d912c10464aea0')

// console.log(`TOPIC_KEY`, keyToString(TOPIC_KEY))

// const topic = crypto.createHash('sha256').update('Insert a topic name here').digest()

export default class HypercoreClient {
  constructor(options = {}){
    const { storagePath } = options
    this.storagePath = storagePath
    this.corestore = new Corestore(this.storagePath)
    // this.topicCore = this.corestore.get({ key: TOPIC_KEY })
  }

  async connect(){
    const seed = dht.hash(Buffer.from(this.storagePath)) // TODO add more uniqueness here
    this.swarm = new Hyperswarm({
      seed,
      // bootstrap: [
      //   { host: '127.0.0.1', port: 49736 },
      // ]
    })
    this.swarmKey = keyToString(this.swarm.keyPair.publicKey)
    // console.log('bootstrapNodes', this.swarm.dht.bootstrapNodes)

    // this.swarm.dht.ready().then(async () => {
    //   console.log('SWARM DHT READY!', {
    //     bootstrapped: this.swarm.dht.bootstrapped,
    //     nodes: this.swarm.dht.nodes,
    //   })
    // })

    console.log(
      `[Hyperlinc] connecting to swarm as`,
      keyToString(this.swarm.keyPair.publicKey),
    )

    process.on('SIGTERM', () => { this.destroy() })

    this.swarm.on('connection', (conn) => {
      console.log(
        '[Hyperlinc] new peer connection from',
        keyToString(conn.remotePublicKey)
      )
      // console.log(conn)
      // console.log(this.swarm)

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
      // await new Promise((resolve, reject) => {
      //   this.swarm.once('connection', () => { resolve() })
      //   setTimeout(() => { reject(new Error(`timeout waiting for peers`)) }, 6000)
      // })
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
    console.log('[Hyperlinc] destroying!')
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
    const discoveryKeys = [...this.corestore.cores.keys()]
    return {
      numberOfPeers: this.swarm.peers.size,
      connected: this.swarm.peers.size > 0,
      numberOfCores: this.corestore.cores.size,
      cores: discoveryKeys.map(discoveryKey => {
        const core = this.corestore.cores.get(discoveryKey)
        return {
          key: keyToString(core.key),
          length: core.length,
        }
      }),
    }
  }
}
