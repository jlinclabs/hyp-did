import Path from 'node:path'
// import jose from 'node-jose'
import JlinxVault from 'jlinx-vault'
import env from '../env.js'

export async function generateVaultKey(){
  return JlinxVault.generateKey().toString('hex')
}

export function getVault(did, vaultKey) {
  const name = `agent-${did.replace(/:/g, '-')}`
  return new JlinxVault({
    path: Path.resolve(env.VAULTS_PATH, `${name}.vault`),
    key: Buffer.from(vaultKey, 'hex')
  })
}

export async function openVault(did, vaultKey){
  const vault = getVault(did, vaultKey)
  await vault.ready()
  return vault
}
