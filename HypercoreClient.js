import Corestore from 'corestore'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import dht from '@hyperswarm/dht'
import { keyToString, keyToBuffer, keyToDid } from './util.js'

// TODO change this to a derivation of "hyp-did"
// const TOPIC_KEY = keyToBuffer('604d03ea2045c1adfcb6adad02d71667e03c27ec846fe4f5c4d912c10464aea0')

// console.log(`TOPIC_KEY`, keyToString(TOPIC_KEY))

// const topic = crypto.createHash('sha256').update('Insert a topic name here').digest()

export default class HypercoreClient {
  constructor(options = {}){
    const { storagePath } = options
    this.storagePath = storagePath
    this.corestore = new Corestore(this.storagePath)
    this.topic = Buffer.from('thisisthetopicfordidsonhypercore')
    // this.topicCore = this.corestore.get({ key: TOPIC_KEY })
  }

  async connect(){
    const seed = dht.hash(Buffer.from(this.storagePath)) // TODO add more uniqueness here
    this.swarm = new Hyperswarm({
      seed,
      bootstrap: [
        { host: '127.0.0.1', port: 49736 },
      ]
    })
    console.log('bootstrapNodes', this.swarm.dht.bootstrapNodes)

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

    this.swarm.on('connection', (socket) => {
      console.log(
        '[Hyperlinc] new peer connection from',
        keyToString(socket.remotePublicKey)
      )
      // console.log(this.swarm)
      this.corestore.replicate(socket, {
        keepAlive: true,
        // live?
      })
    })

    this._ready = this.swarm.join(this.topic).then(() => {
    // this._ready = this.topicCore.ready().then(async () => {
      // console.log(this.swarm)
      console.log(`connecting to hyperlinc swarm ${keyToString(this.topicCore.discoveryKey)}`)
      const peerDiscovery = this.swarm.join(this.topicCore.discoveryKey)
      console.log(`peerDiscovery`, peerDiscovery)
      peerDiscovery.flushed().then(() => {
        console.log(`peerDiscovery flushed!`)
      })


      // this.swarm.status(topic)

      // if (this.swarm.peers.size === 0){
      //   console.log('waiting for first peer…')
      //   await new Promise((resolve, reject) => {
      //     this.swarm.once('connection', () => { resolve() })
      //     setTimeout(
      //       () => { console.error('timeout waiting for first hyperswarm connection') },
      //       60 * 1000
      //     )
      //   })
      // }
    })

    await this.swarm.listen()
    console.log('listening…')
  }

  async ready(){
    if (!this._ready) await this.connect()
    await this._ready
  }

  async destroy(){
    if (this.swarm){
      console.log('[Hyperlinc] disconnecting from swarm')
      await this.swarm.clear()
      await this.swarm.destroy()
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
