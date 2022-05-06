# jlinx

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)


## KeyPairStore

stores your keypairs. depending on the system it picks different storage strategies

## DidStore

- manages connection to hyperswarm
- did read from core
- replicate did documents across swarm
- stores a list of dids you track on disk
- needs a KeyPairStore to store didKeyPairs
  - this is the same KeyPairStore on devices that can hypercore

## HypercoreClient

- used by DidStore to replicate dids across the jlinx hyperswarm
- has a corestore and caches hypercores on disk
- 



## apps

### Did Http Server
### Did CLI

The CLI can do both of our two 

### Did Desktop / Mobile


## Apps that cannot hyperswarm directly


1. you ask the did server to host a did for you
2. it gives you back a did (and a secret)
3. you create a did document locally storing 
4. post it back to the server as a JWT signed with the exact signing key thats in the did document, and include the secret as a param
5. the did server checks the secret, verifies the jwt and writes the initial document as json to the core
4. the did server writes the initial did document to the core


```js
const jlinx = JlinxClient({
  storagePath: '....',
  // keyPairVault
  // either
})
jlinx.keys.create()
jlinx.keys.all()
jlinx.keys.get(publicKey)

jlinx.servers // -> set|map

jlinx.createDidDocument({
  signingKeyPair, // optional else created for you
  encryptingKeyPair, // optional else created for you
  hosted: false || jlinx.servers || [serverHost, serverHost]
})
jlinx.getDidDocument(did)
// // decide which signing and encrypting keys you want to use for your did document
// const signingKeyPair = await keyPairVault.createSigningKeyPair()
// const encryptingKeyPair = await keyPairVault.createEncryptingKeyPair()
```

## Usage

```js
import { DidClient, Keychain } from 'jlinx'
const keys = new Keychain({ })
keys.gener
const DIDS = new DidClient({ keychain })

await DIDS.mine()

const didDocument = await DIDS.get(`did:hyp:XFNojZsnJckWK1ks1MmrIJ3Pa9viXV85uVSftjS6WAA`)
didDocument === {
  "@context": 'https://w3id.org/did/v1',
  id: 'did:hyp:XFNojZsnJckWK1ks1MmrIJ3Pa9viXV85uVSftjS6WAA',
  created: '2018-10-13T17:00:00Z',
  publicKey: [
    {
      id: 'did:hyp:XFNojZsnJckWK1ks1MmrIJ3Pa9viXV85uVSftjS6WAA#signing',
      type: 'ed25519',
      owner: 'did:hyp:XFNojZsnJckWK1ks1MmrIJ3Pa9viXV85uVSftjS6WAA',
      publicKeyBase64: 'XFNojZsnJckWK1ks1MmrIJ3Pa9viXV85uVSftjS6WAA'
    }
  ]
}
```

Also see the 
[jlinx-cli](./cli#readme) 
and 
[jlinx-http-server](./http-server#readme)


