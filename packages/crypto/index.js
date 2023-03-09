import * as u8a from 'uint8arrays'
import sodium from 'sodium-universal'
import crypto from 'crypto'
// import b4a from 'b4a'
// import { base64url } from 'multiformats/bases/base64'
// import { generateKeyPairFromSeed as generateKeyPairFromSeed } from '@stablelib/x25519'
import { generateKeyPairFromSeed, convertSecretKeyToX25519 } from '@stablelib/ed25519';

export { generateKeyPairFromSeed }

const PCT_ENCODED = '(?:%[0-9a-fA-F]{2})'
const ID_CHAR = `(?:[a-zA-Z0-9._-]|${PCT_ENCODED})`
const METHOD_ID = `((?:${ID_CHAR}*:)*(${ID_CHAR}+))`
const encodedPublicKeyRegExp = new RegExp(`^${METHOD_ID}$`)
export function isEncodedPublicKey(key) {
  return encodedPublicKeyRegExp.test(key)
}

export function generateKeyPairSeed(){
  const secretSeed = Buffer.alloc(32)
  crypto.randomFillSync(secretSeed)
  return secretSeed
}

export function generateKeyPair() {
  const seed = generateKeyPairSeed()
  return { ...generateKeyPairFromSeed(seed), seed }
}

export function validateKeyPair(keyPair){
  // TODO
  // const pk = b4a.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES)
  // sodium.crypto_sign_ed25519_sk_to_pk(pk, keyPair.secretKey)
  // return b4a.equals(pk, keyPair.publicKey)
}

export async function makeEncryptable(payload) {
  if (payload instanceof Uint8Array) return payload
  if (typeof payload === 'string') return u8a.fromString(payload)
  // TODO canonicalize json
  return u8a.fromString(JSON.stringify(payload))
}

export function toJSONUint8Array(payload) {
  return u8a.fromString(JSON.stringify(payload))
}

export function encodePayload(payload){
  if (payload instanceof Uint8Array) return payload
  return toJSONUint8Array(payload)
}

export function decodePayload(encoded){
  if (encoded instanceof Uint8Array)
    return JSON.parse(u8a.toString(encoded))
  return encoded
}