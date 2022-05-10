# jlinx

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)

## todo

- `jlinx dids create`
- `jlinx dids list`
- `jlinx keys list`

```


Jlinx Agent
  has one of everything and can do everything
  can use other agents as proxy??
  each action (createDid, resolveDid, updateDid) either 
    A) uses hypercore directly
    B) uses a remote agent over the wire (http)
  the agent id is its public key


if agents can call upon other agents to host documents for them…


Jinx App
  |- KeyStore
    |- filesystem
  |- DidTracker
    |- filesystem
  |- Jlinx DID Client
    |- actions: resolve did, create did, update did
      |- Jlinx Server || Jlinx Server HTTP Proxy
  

CLI
  |_ JlinxApp
    |- filesystem
    |- JlinxClient
    |- JlinxServer

JlinxClient
  |- http

JlinxServer
  |- filesystem
  |- hypercore

```

## Jlinx client apps

- track dids
- store keys
- talk to a jlinx server

## JlinxClient

- talk to a local or remote jlinx server
- has a keyStore
- has a didStore
  - depending on the did actions are either sent to a local or remote did server

## JlinxServer

(move all hypercore stuff here)

- has a keyStore
- has a Hyperswarm
- has a CoreStore
- manages connection to hyperswarm
- replicates did documents across swarm

## KeyStore

- stores crypto keys safely 



### Actions

- resolve(did)
- create()
- amend(did, signedJwtOfNewDidDocument)

```js
// REST API
get(`${host}/${did})              // resolve
post(`${host}/${did}`, signedJWT) // amend
post(`${host}/new`)               // create
```


```
CLI -> JlinxClient 
        L-> JlinxServer(localhost)
        L-> JlinxServer(jlix.io)
JlinxServer -> hyperswarm
```

## KeyStore

- stores your keypairs. 
- depending on the system it picks different storage strategies

## DidStore

- has a keystore
- did read from core
- stores a list of dids you track on disk
- needs a KeyPairStore to store didKeyPairs
  - this is the same KeyPairStore on devices that can hypercore


## apps

### DID Host (DID Server)

an http server that responds to the DID Rest API

### Did CLI

the CLI uses 
- JlinxClient
- JlinxServer

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


