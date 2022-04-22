# hyp-did-http-server

This http server provides a REST HTTP API for reading and writing
[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
persisted and shared using the 
[Hypercore protocol](https://hypercore-protocol.org)


## Setup

```bash
$ npm install -g hyp-did-server
$ PORT=8080 hyp-did-server start
```

or

```js
import hypDidServer from 'hyp-did-server'
const didServer = hypDidServer({
  storagePath: './path/to/store/hypercores',
  port: 8080,
})
didServer.start()
```

