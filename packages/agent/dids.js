import AgentPlugin from './plugin.js'

export default class Dids extends AgentPlugin {
  async resolve(did){
    const didDocument = await this.agent.jlinx.dids.resolve(did)
    return didDocument
  }
}
