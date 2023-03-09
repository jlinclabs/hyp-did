import env from '../env.js'
import { create, urlSource } from 'ipfs-http-client'

const ipfs = create({
  url: env.IPFS_API_URL
})

const { cid } = await ipfs.add('Hello world')
console.info(cid)
// QmXXY5ZxbtuYj6DnfApL


export async function addFromFile(){

}


export async function addFromUrl(...args){
  return await ipfs.add(urlSource(...args))
}
