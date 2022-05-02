# jlinx Hypercore Spec

## Keys



### Creating a new hypercore identity

### when you can hypercore

- signing keys and hypercore keys can be the same

0. create a signing key pair on your machine
0. store the secret in a key vault
0. did = `did:jlinx:${publicKey}`
0. sign a claim that you exist
0. append to hypercore

### when you need a hypercore proxy

- signing keys and hypercore keys are different

- signing keys are held by your device
- hypercore keys are held by the proxy server
  - you cannot move proxy servers without superseeding your identity

0. create a signing key pair on your machine
  - `sodium.crypto_sign_keypair()`
  - this is your identity keypair
0. store the secret in a key vault
0. ask a jlinx did server to host a DID for you
  - HTTP post containing your public key
  - server creates own signing keys, stores secret key
    - this is the kypercore keypair
  - returns did = `did:jlinx:${hypercorePublicKey}`
0. sign a claim that you exist
0. post append event to did server
  - server checks that the signature is valid
  - uses its own privately stored secret keys to append to your hypercore for you
  - the value appended is the message signed by keys you hold


### Signing a claim that you exist

- includes your did
- signed by your idenity keys
