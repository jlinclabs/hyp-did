import { JlinxApp } from 'app-shared/jlinx/app.js'

const jlinxApp = await JlinxApp.open({
  secretSeed: Buffer.from(process.env.JLINX_APP_SECRET_SEED, 'hex'),
  host: new URL(process.env.APP_ORIGIN).host,
})

// jlinxApp.resolveDID(jlinxApp.did).then(
//   ({didDocument}) => {
//     console.log('our didDocument:', didDocument)
//   },
//   error => {
//     console.error(error)
//   }
// )

export default jlinxApp