import b4a from 'b4a'
import b64 from 'urlsafe-base64'

const keyToString = key =>
  typeof key === 'string' ? key : b64.encode(key)

const keyToBuffer = key =>
  Buffer.isBuffer(key) ? key : b64.decode(key)

const keyToDid = key =>
  `did:hyp:${keyToString(key)}`

const didToKey = did =>
  /^did:hyp:([A-Za-z0-9\-_]{43})$/.test(did) && RegExp.$1


const did = 'did:hyp:7HD8ACcToEtnDYNFuQ38c3UuglDirVAlRrN-C_ALB65'
const keyAsHex = 'ec70fc002713a04b670d8345b90dfc73752e8250e2ad502546b37e0bf00b07ae'
const keyAsB64 = '7HD8ACcToEtnDYNFuQ38c3UuglDirVAlRrN-C_ALB65'

console.log(`DID=${did}`)
console.log(`keyAsB64=${keyAsB64}`)
console.log(`keyAsHex=${keyAsHex}`)
console.log(`keyAsB64=${keyToString(keyToBuffer(keyAsB64))}`)
console.log(`keyToBuffer("${keyAsB64}") ->`, keyToBuffer(keyAsB64))

console.assert(
  didToKey(did) === keyAsB64,
  `expected\n"${didToKey(did)}"\n===\n"${keyAsB64}"`,
)

console.assert(
  keyToString(keyToBuffer(keyAsB64)) === keyAsB64,
  `expected\n  "${keyToString(keyToBuffer(keyAsB64))}"\n  ===\n  "${keyAsB64}"`,
)
