# jlinx

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)











client      <->      Node
            create->Core
            get->Core(getLength,getEntry,append)

client      <->      remoteHttpNode      <->      httpNode                <->      host      <->      Node
            create                       create                                              create      
            get                          getEntry(length-in-http-header)                     get    
                                         append                                      



# Data Flow                                     

```
client <-> host <-> node
OR
client <-> remoteHttpHost <-> hostHttpApi <-> host <-> node
```

## Client

### State

- set of document ids relevant to you
- document owner signing keys
- document encryption keys

### API

```
client.host.create
client.host.get
```

## RemoteHttpHost

### State

none :D

### API

```
host.create()
  const id = http.post(host/create)
  return new Document(this, id)
host.get 
  new Document(this, id)
host._getEntry
host._append
```

## HostHttpServer

### State

none :D

### API

```
POST /create

GET /:id FUTURE (stream entire file)

GET /:id/:index
```


## Host

### State

- hypercore private keys
- hypercore data contents

## node

### State

none :D












## "Dependency" Tree

jlinc-client -1:N-> jlinc-host -1:1-> jlinc-node


- jlinx-node: talks to hypercore
  - has a public key
- jlinx-host: owns documents
  - hosts documents
    - protects document private keys
  - exposed over http and RPC
- jlinx-client: talks to hosts




```
          swarm
       /         \              \
      /           \              \
jlinc-client    jlinc-client    jlinc-client
     |               |               |
jlinx-host(A)   jlinx-host(B)   desktop app
     |        /
     |       /
     |      /
jlinx-client
     |
some-web-app


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




