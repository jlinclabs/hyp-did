import AgentPlugin from './plugin.js'

export default class Contacts extends AgentPlugin {

  get _records () {
    return this.__records ??= this.agent.vault.records('contacts')
  }

  async all(){
    return await this._records.all()
  }

  async add(did){
    let record = await this._records.get(did)
    if (!record) {
      record = await this._records.set(did, {
        did,
        addedAt: this.agent.now,
      })
    }
    return record
  }

  async delete(did){
    return await this._records.delete(did)
  }
}
