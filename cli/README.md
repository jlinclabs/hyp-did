# hyp-did-cli

This command line interface allows for reading and writing
[Decentralized IDs (DIDs)](https://w3c.github.io/did-core/) 
persisted and shared using the 
[Hypercore protocol](https://hypercore-protocol.org)


## Setup

```bash
$ npm install -g hyp-did-cli
$ hyp-did-cli --help
```


```bash
$ hyp-did create
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
  "created": "2022-04-22T22:23:45.151Z",
  "publicKey": [
    {
      "id": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
      "type": "ed25519",
      "owner": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
      "publicKeyBase64": "38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28"
    }
  ],
  "updatedAt": "2022-04-22T22:23:45.151Z"
}
```

```bash
$ hyp-did resolve 'did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28'
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
  "created": "2022-04-22T22:23:45.151Z",
  "publicKey": [
    {
      "id": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
      "type": "ed25519",
      "owner": "did:hyp:38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28",
      "publicKeyBase64": "38tk783tfU3ESyYUM4BixeqsGykX3dGsLDW-elEB_28"
    }
  ],
  "updatedAt": "2022-04-22T22:23:45.151Z"
}
```

or

```js
import HypDidServer from 'hyp-did-server'
const didServer = new HypDidServer()
didServer.listen(8080)
```

