

import { keyToMultibase } from './util.js'

export default class DidDocument {
  constructor(opts){
    this.did = opts.did

  }
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
