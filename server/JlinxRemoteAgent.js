import Debug from 'debug'
import http from 'node:http'
import https from 'node:https'
import fetch from 'node-fetch'
import { URL } from 'url'
import { createSigningKeyPair, keyToBuffer, keyToDid, didToKey } from 'jlinx-core/util.js'

const debug = Debug('jlinx:remoteAgent')

const options = {
  agent: function(_parsedURL) {
    if (_parsedURL.protocol == 'http:') {
      return httpAgent;
    } else {
      return httpsAgent;
    }
  }
};

export default class JlinxRemoteAgent {

  constructor(url, opts = {}){
    this.url = url
    this.httpAgent = new http.Agent({ keepAlive: true })
    this.httpsAgent = new https.Agent({ keepAlive: true })
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

  async ready(){
    if (this._ready) this._ready = (async () => {


    })()
    return await this._ready
  }

  async connected(){
    return await this.ready()
  }

  async destroy(){
    this.httpAgent.destroy()
  }

  async fetch(path, options){
    const url = new URL(`${this.url}${path}`)
    options.agent = this.httpAgent
    options.headers = {
      Accepts: 'application/json',
      ...options.headers
    }
    debug('FETCH', url, options)
    const response = await fetch(url, options)
    debug({ response })
    return await response.json()
  }

  async getJSON(path){
    return this.fetch(path, { method: 'get' })
  }

  async postJSON(path, body){
    return this.fetch(path, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    })
  }

  async resolveDid(did){

  }

  async createDid(){
    return await this.postJSON('/new', {})
  }

  async amendDid({did, secret, value}){
    return await this.postJSON(`/${did}`, {
      secret, didDocument: value
    })
  }


}

