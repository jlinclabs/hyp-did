import { randomBytes } from 'jlinx-util'
import { postJSON } from '../lib/http.js'
import AgentPlugin from './plugin.js'

export default class Agreements extends AgentPlugin {

  get _records () {
    return this.__records ??= this.agent.vault.records('agreements')
  }

  async create({ parties, terms, signatureDropoffUrl }){
    console.log('creating agreement', { parties, terms })
    if (!parties.includes(this.agent.did)){
      parties.unshift(this.agent.did)
    }
    const createdAt = this.agent.now
    const details = {
      '@context': 'https://agents.jlinx.io/agreement.json',
      owner: this.agent.did,
      unique: randomBytes(16).toString('hex'),
      parties,
      terms,
      createdAt,
    }
    const jws = await this.agent.createJWS(details)
    const agreement = {
      details,
      signableDetails: jws.payload,
      signatures: {
        [this.agent.did]: {
          ...jws.signatures[0],
          signedAt: createdAt,
        }
      },
      signatureDropoffUrl,
    }
    console.log({ agreement })
    const doc = await this.agent.jlinx.create(
      agreement,
      {
        // schema: //TODO
      }
    )
    const id = doc.id.toString()
    await this._records.set(id, { })
    return { id }
  }

  async get(id){
    return await Agreement.get(this, id)
  }

  async sign(id){
    const agreement = await this.get(id)
    await agreement.sign()
    await this._records.set(id, { })
    return agreement
  }

  async ackSignature(signatureId){
    const signature = await Signature.get(this, signatureId)
    console.log('ACKING', { signature })
    if (!signature.agreementId) {
      throw new Error(`unable to find agreement id in signature`)
    }
    const agreement = await this.get(signature.agreementId)
    await agreement.ackSignature(signature)
  }

  async all(){
    const ids = await this._records.ids.all()
    return Promise.all(
      ids.map(async id => this.get(id))
    )
  }
}


class Document {

  static async get(collection, id){
    const doc = await collection.agent.jlinx.get(id)
    return new this(collection, doc)
  }

  constructor(agreements, doc){
    this.agreements = agreements
    this.doc = doc
    this.agent = agreements.agent
  }

  get id () { return this.doc.id.toString() }
}

class Agreement extends Document {

  get details() { return this.doc.content.details }
  get signatures() { return this.doc.content.signatures }
  get signableDetails() { return this.doc.content.signableDetails }
  get signatureDropoffUrl() { return this.doc.content.signatureDropoffUrl }
  get owner(){ return this.details.owner }
  get unique(){ return this.details.unique }
  get parties(){ return this.details.parties }
  get terms(){ return this.details.terms }
  get createdAt(){ return this.details.createdAt }

  sync(){ return this.doc.sync() }

  toJSON () {
    return {
      id: this.id,
      signatures: this.signatures,
      owner: this.owner,
      unique: this.unique,
      parties: this.parties,
      terms: this.terms,
      createdAt: this.createdAt,
    }
  }

  async sign(){
    if (!this.parties.includes(this.agent.did))
      throw new Error(`you are not a party of this agreement`)

    const jws = await this.agent.createJWS(this.details)
    if (jws.payload !== this.signableDetails)
      throw new Error(`jws payload mismatch`)

    const signature = await Signature.create(this, {
      agreementId: this.id,
      ...jws.signatures[0]
    })

    console.log({ signature })

    await postJSON(
      this.signatureDropoffUrl,
      {
        agreementId: this.id,
        signatureId: signature.id,
      }
    )
    await this.sync()

    const sig = this.signatures[this.agent.did]
    console.log('GOT SIG ACKd', sig)

    return {
      agreementId: this.id,
      signatureId: signature.id,
    }
  }

  async ackSignature(signature){
    const signerDid = signature.signerDid
    console.log('ackSignature', this, signature)
    // if (!agreement.details.parties.includes(this.agent.did))
    if (!this.parties.includes(signerDid))
      throw new Error(`not party to agreement. did="${signerDid}"`)

    if (this.signatures[signerDid])
      throw new Error(`party already signed agreement. did="${signerDid}"`)

    await this.doc.update({
      ...this.doc.content,
      signatures: {
        ...this.doc.content.signatures,
        [signerDid]: signature.toAgreementRef(),
      }
    })
    console.log('ACKd Signature', {
      signature,
      agreement: this,
    })
  }

}

class Signature extends Document {

  static async create(agreements, content){
    const doc = await agreements.agent.jlinx.create(
      {
        ...content,
        '@context': 'https://agents.jlinx.io/agreement-signature.json',
        signedAt: agreements.agent.now,
      },
      {
        // schema: //TODO
      }
    )
    return new Signature(agreements, doc)
  }

  get signedAt () { return this.doc.content.signedAt }
  get agreementId () { return this.doc.content.agreementId }
  get signature () { return this.doc.content.signature }
  get protected () { return this.doc.content.protected }
  get signerDid () { return this.doc.metadata.controllers[0] }

  toJSON(){
    return {
      id: this.id,
      agreementId: this.agreementId,
      signerDid: this.signerDid,
    }
  }

  toAgreementRef(){
    return {
      signature: this.signature,
      protected: this.protected,
      signedAt: this.signedAt,
    }
  }
}
