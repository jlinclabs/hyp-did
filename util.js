
import b64 from 'urlsafe-base64'

export const keyToString = key =>
  typeof key === 'string' ? key : b64.encode(key)

export const keyToBuffer = key =>
  Buffer.isBuffer(key) ? key : b64.decode(key)

export const keyToDid = key =>
  `did:hyp:${keyToString(key)}`

export const didToKey = did =>
  /^did:hyp:([A-Za-z0-9\-_]{43})$/.test(did) && RegExp.$1
