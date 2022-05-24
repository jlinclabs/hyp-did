# jlinx

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)

## "Dependency" Tree

```
jlinx-util
 |
 |\
 | \- jlinx-node
 |     |   \- jlinx-http-server
 |     |             |
 |     |    /- jlinx-http-node
 |     |   /
 |     |  /
 |- jlinx-client
    |
    \- jlinx-cli
    |
    \- jlinx-desktop
```
## Modules

### jlinx-util

https://github.com/jlinclabs/jlinx-util

Depencencies
- lib-sodium



### jlinx-node

https://github.com/jlinclabs/jlinx-node

#### Depencencies
- jlinx-util
- hypercore

#### API

- get(publicKey, [privateKey]) -> document
- create(type) -> document

### jlinx-client

https://github.com/jlinclabs/jlinx-client

Depencencies
- jlinx-util

Injected Depencencies (or api compliant)
- jlinx-node (or API compliant. see jlinx-http-node)
- Keystore a place to store keypairs (jlinx-keystore or API compliant)
- Didstore a place to track dids
- AccountStore ???
- are we doing stores for all persistance?

talks to one or more jlinx-node instances

API
- get(url) -> document
- create(type) -> document

¿¿¿¿ what if we move the WhateverStores to a layer above this so
  - the client doesnt store any private keys AKA all methods reqire you pass it in


### jlinx-cli

https://github.com/jlinclabs/jlinx-cli

Depencencies
- jlinx-client

### jlinx-desktop

https://github.com/jlinclabs/jlinx-desktop

Depencencies
- jlinx-client




### jlinx-http-server

https://github.com/jlinclabs/jlinx-http-server

Depencencies
- jlinx-node

exposes the jlinx-node api over http to the jlinc-http-server

- get(publicKey) -> document heaader
- create(publicKey, cleric type) -> publicKey, secret

### jlinx-http-node

https://github.com/jlinclabs/jlinx-http-node

Depencencies
- jlinx-util

api parody of jlinx-node api talking to a jlinc-http-server




