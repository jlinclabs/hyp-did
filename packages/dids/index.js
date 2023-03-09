import * as u8a from 'uint8arrays'
import { Resolver, parse as parseDID } from 'did-resolver'
import { getResolver as getWebResolver } from 'web-did-resolver'
import { DID } from 'dids'
import {
  Ed25519Provider,
  encodeDID as publicKeyToDidKey,
} from 'key-did-provider-ed25519'
import KeyResolver from 'key-did-resolver'
// import { keyToDidDoc } from 'key-did-resolver'

import { generateKeyPairSeed } from './crypto.js'
export { DID, parseDID, publicKeyToDidKey }

export const webResolver = getWebResolver()

export const didResolver = new Resolver({
  ...webResolver,
  ...KeyResolver.getResolver(),
})

export async function resolveDID(did){
  return await didResolver.resolve(did)
}

export async function generateDidKey(){
  const secretSeed = generateKeyPairSeed()
  const did = await openDidKey(secretSeed)
  return { secretSeed, did }
}

export async function openDidKey(secretSeed) {
  const provider = new Ed25519Provider(secretSeed)
  const did = new DID({ provider, resolver: didResolver })
  // Authenticate with the provider
  await did.authenticate()
  return did
}


// stolen from duplicate code in key-did-privider-ed25519 and key-did-resolver
export function encodeKey(key) {
  const bytes = new Uint8Array(key.length + 2);
  // TODO can we just use multiformats here instead?
  // https://github.com/multiformats/multicodec/blob/master/table.csv
  bytes[0] = 0xec;
  bytes[1] = 0x01;
  bytes.set(key, 2);
  return `z${u8a.toString(bytes, 'base58btc')}`;
}

// mirrors encodeDID from key-did-provider-ed25519
export function didToPublicKey(did) {
  const encodedPublicKey = did.split(':')[2]
  const bytes = u8a.fromString(encodedPublicKey.slice(1), 'base58btc')
  return bytes.slice(2) //slice off those mystery bits
}

export function didKeyDocumentToDidWebDocument(keyDoc, did) {
  keyToDidDoc

  // const webit = string => `${string}`.replace(keyDoc.id, did)
  // const webDoc = {
  //   id: did,
  // }
  // if (keyDoc.verificationMethod) {
  //   webDoc.verificationMethod = keyDoc.verificationMethod
  //     .map(vm => {
  //       return {
  //         ...vm,
  //         id: webit(vm.id),
  //         controller: webit(vm.controller),
  //       }
  //     })
  // }
  // // // we have to make this??
  // // const didWeb = {
  // //   ...didKey,
  // //   id: this.did,
  // // }
  // // return didWeb
  // return {
  //   '@context': 'https://www.w3.org/ns/did/v1',
  //   'id': this.id,
  //   // 'verificationMethod': [{
  //   //   'id': this.id + '#controller',
  //   //   'type': 'Ed25519VerificationKey2018',
  //   //   'controller': this.id,
  //   // }],
  //   // 'authentication': [
  //   //   'did:web:example.com#controller'
  //   // ]
  // }
}
//
// function example2() {
//   const webResolver = getResolver()
//
//   const didResolver = new Resolver({
//     ...webResolver
//     //...you can flatten multiple resolver methods into the Resolver
//   })
//
//   didResolver.resolve('did:web:uport.me').then(doc => console.log(doc))
//
//   // You can also use ES7 async/await syntax
//   ;(async () => {
//     const doc = await didResolver.resolve('did:web:uport.me')
//     console.log(doc)
//   })();
//
// }
//
//
//
//
//
// export async function getDid(didString, secretSeed){
//
//
//   const did = new DID({
//     provider: threeID.getDidProvider(),
//     resolver: {
//       ...getDid3IDResolver(ceramic),
//       ...getDidKeyResolver(),
//     },
//   })
//
//   // THIS IS ALSO QUITE SLOW
//   console.log('[ceramic] authenticating did', { did })
//   await did.authenticate()
//
//   if (did.id !== didString){
//     throw new Error(`resolved the wrong did: "${did.id}" !== "${didString}"`)
//   }
//   return did
// }
