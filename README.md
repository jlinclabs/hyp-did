# hyp-did

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)


## Keychain

stores your keypairs. depending on the system it picks different storage strategies

## DidClient

- manages connection to hyperswarm
- did read from core
- replicate did documents across swarm


## Apps that cannot hyperswarm directly


1. you ask the did server to host a did for you
2. it gives you back a did (and a secret)
3. you create a did document locally storing 
4. post it back to the server as a JWT signed with the exact signing key thats in the did document, and include the secret as a param
5. the did server checks the secret, verifies the jwt and writes the initial document as json to the core
4. the did server writes the initial did document to the core


## Usage

```js
import { DidClient, Keychain } from 'hyp-did'
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
[hyp-did-cli](./cli#readme) 
and 
[hyp-did-http-server](./http-server#readme)


