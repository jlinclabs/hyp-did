import fs from 'fs/promises'
import b64 from 'urlsafe-base64'
import b4a from 'b4a'
import sodium from 'sodium-universal'

const PREFIX = 'did:jlinx:'
const LENGTH = PREFIX.length + 43

export const DID_JLINX_REGEXP = /^did:jlinx:([A-Za-z0-9\-_]{43})$/

export const isPublicKey = publicKey =>
  keyToString(publicKey).match(/^[A-Za-z0-9\-_]{43}$/)

export const isJlinxDid = did =>
  DID_JLINX_REGEXP.test(did)

export const keyToString = key =>
  typeof key === 'string' ? key : b64.encode(key)

export const keyToBuffer = key =>
  Buffer.isBuffer(key) ? key : b64.decode(key)

export const keyToDid = key =>
  `${PREFIX}${keyToString(key)}`

export const keyToMultibase = key =>
  `u${keyToString(key)}`

export const didToKey = did =>
  DID_JLINX_REGEXP.test(did) && RegExp.$1

export function createSigningKeyPair(seed){
  const publicKey = b4a.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES)
  const secretKey = b4a.allocUnsafe(sodium.crypto_sign_SECRETKEYBYTES)
  if (seed) sodium.crypto_sign_seed_keypair(publicKey, secretKey, seed)
  else sodium.crypto_sign_keypair(publicKey, secretKey)
  return { publicKey, secretKey }
}

export function validateSigningKeyPair(keyPair) {
  const pk = b4a.allocUnsafe(sodium.crypto_sign_PUBLICKEYBYTES)
  sodium.crypto_sign_ed25519_sk_to_pk(pk, keyPair.secretKey)
  return b4a.equals(pk, keyPair.publicKey)
}

export function createEncryptingKeyPair(){
  const publicKey = b4a.allocUnsafe(sodium.crypto_box_PUBLICKEYBYTES)
  const secretKey = b4a.allocUnsafe(sodium.crypto_box_SECRETKEYBYTES)
  sodium.crypto_box_keypair(publicKey, secretKey);
  return { publicKey, secretKey }
}

export function validateEncryptingKeyPair(keyPair) {
  const nonce = b4a.allocUnsafe(sodium.crypto_box_NONCEBYTES)
  const message = b4a.from('Hello, World!')
  const mac = b4a.allocUnsafe(sodium.crypto_box_MACBYTES)
  const cipher = b4a.allocUnsafe(message.length)
  sodium.crypto_box_detached(cipher, mac, message, nonce, keyPair.publicKey, keyPair.secretKey)
  const plain = b4a.allocUnsafe(cipher.length)
  sodium.crypto_box_open_detached(plain, cipher, mac, nonce, keyPair.publicKey, keyPair.secretKey)
  return b4a.equals(plain, message)
}

export async function fsExists(path){
  try{
    await fs.stat(path)
    return true
  }catch(error){
    if (error.code === 'ENOENT') return false
    throw error
  }
}
