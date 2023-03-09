import Debug from 'debug'
import jsonCanonicalize from 'canonicalize'
import {
  createDocument,
  loadDocument,
  createDid,
  getDid,
  resolveDidDocument
} from './ceramic.js'

const debug = Debug('jlinx')

export class JlinxClient {

  static async open(didString, secretSeed){
    debug('OPEN', { didString, secretSeed })
    const did = await getDid(didString, secretSeed)
    return new JlinxClient(did)
  }

  constructor({ did, secretSeed }){
    debug('new JlinxClient', { did })
    // this.readOnly = !did
    this.did = did
    this.getDID = async () => {
      return this._DID ??= await getDid(did, secretSeed)
    }
    this.dids = new JlinxDids(this)
  }

  async createJWS(signable){
    const did = await this.getDID()
    return await did.createJWS(signable)
  }

  async get(id, opts = {}){
    const doc = await loadDocument(
      id,
      {...opts}
    )
    console.log('loaded', doc.id)
    return doc
  }

  async create(content, { metadata, ...opts } = {}){
    const doc = await createDocument(
      content,
      {
        family: 'jlinx',
        ...metadata
      },
      {
        asDID: await this.getDID(),
        ...opts
      }
    )
    return doc
  }
}

class JlinxPlugin {
  constructor(jlinxClient){
    this.jlinxClient = jlinxClient
  }
}

class JlinxDocument {
  constructor(jlinxClient, doc){
    this.jlinxClient = jlinxClient
    this.doc = doc // a ceramic tile stream
  }
  get id(){ return this.doc.id }
  get content(){ return this.doc.content }
  get controllers(){ return this.doc.controllers }
  toJSON(){ return this.content }

  async sync(){
    await this.doc.sync({
      // sync: SyncOptions.SYNC_ALWAYS // TODO
    })
  }

  async update(content, metadata, opts = {}) {
    await this.doc.update(content, metadata, {
      asDID: await this.getDID(), ...opts
    })
    await this.sync()
    // TODO consider this.doc.requestAnchor()
  }

  async patch(patch, metadata, opts = {}) {
    const content = {...this.content, ...patch}
    await this.update(content, metadata, opts = {})
  }
}

class JlinxDids extends JlinxPlugin {
  async create(...opts){
    const { jlinxClient } = this
    const { did, secretSeed } = await createDid(...opts)
    const didDocument = await resolveDidDocument(did.id)
    return new Did({
      jlinxClient,
      did,
      secretSeed,
      didDocument,
    })
  }

  async resolve(did){
    return await resolveDidDocument(did)
  }
  // async get(didString, secretSeed){
  //   // const did = await getDid(didString, secretSeed)
  //   // return new Did(this, did, secretSeed)
  //   const { jlinxClient } = this
  //   const did = secretSeed ? await getDid(didString, secretSeed) : undefined
  //   const didDocument = await resolveDidDocument(didString)
  //   return new Did({
  //     jlinxClient,
  //     // did,
  //     secretSeed,
  //     didDocument,
  //   })
  // }
}

class Did {
  constructor(opts = {}){
    this.jlinxClient = opts.jlinxClient
    this.did = opts.did
    this.secretSeed = opts.secretSeed
    this.didDocument = opts.didDocument
  }
  get id () { return this.didDocument.id }
}


class JlinxProfiles extends JlinxPlugin {
  async create(content, opts = {}){
    const doc = await this.jlinxClient.create(
      content,
      {...opts}, // TODO { schema }
    )
    return new Profile(this.jlinxClient, doc)
  }
  async get(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new Profile(this.jlinxClient, doc)
  }
}

class Profile extends JlinxDocument {
  get name(){ return this.content.name }
  get avatar(){ return this.content.avatar }
}


class JlinxContracts extends JlinxPlugin {
  async create(...opts){
    console.log('JlinxContracts.create', this, opts)
    const doc = await this.jlinxClient.create(...opts)
    return new Contract(this.jlinxClient, doc)
  }

  async get(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new Contract(this.jlinxClient, doc)
  }

  async offerContract(opts = {}){
    const {
      offerer = this.jlinxClient.did,
      contractUrl,
      signatureDropoffUrl
    } = opts
    return this.create({
      state: 'offered',
      offerer,
      contractUrl,
      signatureDropoffUrl
    })
  }

  async getSignature(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new ContractSignature(this.jlinxClient, doc)
  }
}

class Contract extends JlinxDocument {

  get state(){ return this.content?.state }
  get offerer(){ return this.content?.offerer }
  get contractUrl(){ return this.content?.contractUrl }
  get signatureDropoffUrl(){ return this.content?.signatureDropoffUrl }
  get signatureId(){ return this.content?.signatureId }

  async offerContract(opts = {}){
    console.log('Offer Contract', this, this.doc)
    const {
      offerer,
      contractUrl,
      signatureDropoffUrl
    } = opts
    await this.patch({
      "@context": "https://schemas.jlinx.io/contract-v0.json",
      state: 'offered',
      offerer,
      contractUrl,
      signatureDropoffUrl
    })
  }

  async sign(){
    const signature = await this.jlinxClient.create({
      contractId: this.id.toString(),
      identifierId: this.jlinxClient.did,
    })
    console.log('CREATED SIGNATURE', {
      signature,
      'signature.content': signature.content,
      'signature.controllers': signature.controllers,
    })
    return signature
  }

  async ackSignature(signature){
    await this.sync()
    if (this.state !== 'offered'){
      throw new Error(`contract not in "offered" state.`)
    }
    await signature.sync()
    if (signature.content.contractId !== this.id.toString()){
      throw new Error(`signature.contractId does not match contract.id`)
    }
    const signer = signature.controllers[0]
    if (!signer){
      throw new Error(`signature has no controllers`)
    }
    await this.patch({
      state: 'signed',
      signatureDropoffUrl: undefined,
      signatureId: signature.id.toString(),
      signer,
    })
  }
}

class ContractSignature extends JlinxDocument {
  get contractId(){ return this.content?.contractId }
  get identifierId(){ return this.content?.identifierId }
}









// SISAS



class JlinxSisas extends JlinxPlugin {
  async create(...opts){
    console.log('JlinxSisas.create', this, opts)
    const doc = await this.jlinxClient.create(...opts)
    return new Sisa(this.jlinxClient, doc)
  }

  async get(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new Sisa(this.jlinxClient, doc)
  }

  async offerSisa(opts = {}){
    const {
      offerer = this.jlinxClient.did,
      requestedDataFields,
      signatureDropoffUrl,
    } = opts
    return this.create({
      state: 'offered',
      offerer,
      requestedDataFields,
      signatureDropoffUrl,
    })
  }

  async getSignature(...opts){
    const doc = await this.jlinxClient.get(...opts)
    return new SisaSignature(this.jlinxClient, doc)
  }
}


class Sisa extends JlinxDocument {

  get state(){ return this.content?.state }
  get offerer(){ return this.content?.offerer }
  // get contractUrl(){ return this.content?.contractUrl }
  get signatureDropoffUrl(){ return this.content?.signatureDropoffUrl }
  get signatureId(){ return this.content?.signatureId }

  async offerSisa(opts = {}){
    console.log('Offer Sisa', this, this.doc)
    const {
      offerer,
      signatureDropoffUrl,
      requestedDataFields,
    } = opts
    await this.patch({
      "@context": "https://schemas.jlinx.io/sisa-v0.json",
      state: 'offered',
      offerer,
      signatureDropoffUrl,
      requestedDataFields,
    })
  }

  async sign(){
    const signature = await this.jlinxClient.create({
      contractId: this.id.toString(),
      identifierId: this.jlinxClient.did,
    })
    console.log('CREATED SIGNATURE', {
      signature,
      'signature.content': signature.content,
      'signature.controllers': signature.controllers,
    })
    return signature
  }

  async ackSignature(signature){
    await this.sync()
    if (this.state !== 'offered'){
      throw new Error(`contract not in "offered" state.`)
    }
    await signature.sync()
    if (signature.content.contractId !== this.id.toString()){
      throw new Error(`signature.contractId does not match contract.id`)
    }
    const signer = signature.controllers[0]
    if (!signer){
      throw new Error(`signature has no controllers`)
    }
    await this.patch({
      state: 'signed',
      signatureDropoffUrl: undefined,
      signatureId: signature.id.toString(),
      signer,
    })
  }
}

class SisaSignature extends JlinxDocument {
  get contractId(){ return this.content?.contractId }
  get identifierId(){ return this.content?.identifierId }
}
