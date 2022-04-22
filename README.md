# hyp-did

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)


## Usage

```js
import { DidClient } from 'hyp-did'
const DIDS = new DidClient()
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


