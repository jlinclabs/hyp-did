import b4a from 'b4a'
import b64 from 'urlsafe-base64'
import crypto from 'hypercore-crypto'

const keyToString = key =>
  typeof key === 'string' ? key : b64.encode(key)

const keyToBuffer = key =>
  Buffer.isBuffer(key) ? key : b64.decode(key)

function test(){
  const { publicKey: keyAsBuffer } = crypto.keyPair()
  const keyAsString = keyToString(keyAsBuffer)
  const keyAsBuffer2 = keyToBuffer(keyAsString)
  const keyAsString2 = keyToString(keyAsBuffer2)
  if (keyAsString !== keyAsString2)
    throw new Error(`expected "${keyAsString}" === "${keyAsString2}"`)
}

let count = 1000 * 10
while (count--) test()



// did:hyp:xzBJSi9S357xbBIME0aG_SZXM_Ncx3--4tEaSHtfBic
// did:hyp:-------------------------------------------
