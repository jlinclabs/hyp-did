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
  console.assert(
    keyAsString === keyAsString2,
    `expected "${keyAsString}" === "${keyAsString2}"`
  )
  // process.stdout.write('.')
}

let count = 1000 * 10
while (count--) test()



// const keyAsB64 = '7HD8ACcToEtnDYNFuQ38c3UuglDirVAlRrN-C_ALB65'
// const keyAsBuffer = keyToBuffer(keyAsB64)

// console.assert(
//   keyToString(keyAsBuffer) === keyAsB64,
//   `expected\n  "${keyToString(keyAsBuffer)}"\n  ===\n  "${keyAsB64}"`,
// )



// // THIS IS FUCKED!~!
