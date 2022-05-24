# jlinx

[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
using the 
[Hypercore protocol](https://hypercore-protocol.org)

[SPEC](./SPEC.md)


## TODO

rename 
```
jlinx-core -> jlinx-util
jlinx-server -> jlinx-node
jlinx-app -> jlinx-client
```

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

Depencencies
- jlinx-util
- hypercore

### jlinx-client

https://github.com/jlinclabs/jlinx-client

Depencencies
- jlinx-util
- jlinx-node
- jlinx-http-node

talks to one or more jlinx-node instances

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

### jlinx-http-node

https://github.com/jlinclabs/jlinx-http-node

Depencencies
- jlinx-util

api parody of jlinx-node api talking to a jlinc-http-server
