import JlinxClient from 'jlinx-client'
import JlinxServer from 'jlinx-server'

class JlinxApp {

  static get defaultStoragePath(){
    return Path.join(os.homedir(), '.jlinx')
  }

  constructor(opts = {}){
    this.storagePath = opts.storagePath || JlinxClient.defaultStoragePath

    this.client = new JlinxClient({
      storagePath: this.storagePath,
    })
  }
}
