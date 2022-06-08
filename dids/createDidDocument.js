import { isJlinxDid, keyToMultibase } from './index.js'

export default function createDidDocument (options = {}) {
  const { did, signingPublicKey, encryptingPublicKey } = options
  if (!did) throw new Error('did is required')
  if (!isJlinxDid(did)) throw new Error('incorrect JLINX DID format')
  if (!signingPublicKey) throw new Error('signingPublicKey is required')
  if (!encryptingPublicKey) throw new Error('encryptingPublicKey is required')

  const didDocument = {
    '@context': 'https://www.w3.org/ns/did/v1',
    id: did,
    created: new Date().toISOString(),
    verificationMethod: [
      {
        id: `${did}#signing`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: keyToMultibase(signingPublicKey)
      }
    ],
    keyAgreement: [
      {
        id: `${did}#encrypting`,
        type: 'X25519KeyAgreementKey2019',
        controller: did,
        publicKeyMultibase: keyToMultibase(encryptingPublicKey)
      }
    ],
    authentication: [
      `${did}#signing`
    ]
  }

  return didDocument
}
