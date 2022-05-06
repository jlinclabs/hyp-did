

import {
  didToKey,
  keyToString,
  keyToMultibase,
} from './util.js'

export default class DidDocument {

  constructor({did, core}){
    this.did = did
    this.publicKey = didToKey(did)
    this.core = core
  }

  get writable(){ return this.core.writable }

  get published(){ return false /* TBD */}

  // get exists(){ return false /* TBD */}

  [Symbol.for('nodejs.util.inspect.custom')](depth, opts){
    let indent = ''
    if (typeof opts.indentationLvl === 'number')
      while (indent.length < opts.indentationLvl) indent += ' '
    return this.constructor.name + '(\n' +
      indent + '  did: ' + opts.stylize(this.did, 'string') + '\n' +
      indent + '  writable: ' + opts.stylize(this.writable, 'boolean') + '\n' +
      indent + '  published: ' + opts.stylize(this.published, 'boolean') + '\n' +
      indent + '  loaded: ' + opts.stylize(this.loaded, 'boolean') + '\n' +
      // indent + '  publicKey: ' + opts.stylize(this.publicKey, 'string') + '\n' +
      // indent + '  value: ' + opts.stylize(this.value ? JSON.stringify(this.value) : '', 'string') + '\n' +
      indent + ')'
  }

  async update(){
    await this.core.update()
    if (keyToString(this.core.key) !== this.publicKey)
      throw new Error(`key mismatch ${[keyToString(this.core.key), this.publicKey]}`)
    this.loaded = true
    if (this.core.length > 0){
      const json = await this.core.get(this.core.length - 1)
      this._value = JSON.parse(json)
    }
  }

  get value(){
    if (this.loaded) return this._value
    throw new Error(`cannot get value before loaded`)
  }

  async exists(){
    await this.update()
    return this.core.length > 0
  }

  async amend(value){
    // if (!this.writable)
    //   throw new Error(`did document is not writable`)
    return await this.core.append([JSON.stringify(value)])
  }

  // async create(){
  //   // // maybe check that the core is empty first? validations?


  //   // // TODO
  //   // // each entry in the hypercore is a JWT
  //   // // JWT is signed by did signing keys
  //   // // we need a layer between here and where the other different did keys are



  //   // const payload = JSON.stringify({
  //   //   "@context": "https://w3id.org/did/v1",
  //   //   id: this.did,
  //   //   created: new Date,
  //   //   publicKey: [
  //   //     {
  //   //       id: this.did,
  //   //       type: 'ed25519', // ???
  //   //       owner: this.did,
  //   //       publicKeyBase64: this.publicKey,
  //   //       // TODO seperate did-signing and did-encrypting
  //   //     },
  //   //   ]
  //   // })
  //   // const signature = sign(payload, this.signingKey)
  //   // const jwt = '??'

  //   // await this._append(jwt)

  //   // await this.update()
  //   // // write to it
  //   // // ¿ ensure it was replicated to a permanode ?
  //   //   // we could curl a did-server and invoke their caching of it
  // }


  // async _append(newValue){
  //   // await this.update()
  //   newValue = { ...newValue, updatedAt: new Date }
  //   const json = JSON.stringify(newValue)
  //   return await this.core.append([json])
  // }

}

DidDocument.generate = function(opts){
  const {
    did,
    signingPublicKey,
    encryptingPublicKey,
  } = opts

  return {
    '@context': this.contextUrl,
    id: did,
    created:  new Date().toISOString(),
    verificationMethod: [
      {
        id: `${did}#signing`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: keyToMultibase(signingPublicKey),
      },
    ],
    "keyAgreement": [
      {
        id: `${did}#encrypting`,
        type: 'X25519KeyAgreementKey2019',
        controller: did,
        publicKeyMultibase: keyToMultibase(encryptingPublicKey),
      },
    ],
    "authentication": [
      `${did}#signing`,
    ],
  }
}
