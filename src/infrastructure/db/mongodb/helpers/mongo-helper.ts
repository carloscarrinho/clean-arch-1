import { Collection, MongoClient } from 'mongodb'

export const MongoHelper = ({
  client: null as MongoClient,

  async connect (uri: string): Promise<void> {
    this.client = await MongoClient.connect(uri)
  },

  async disconnect (): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
    }
  },

  async getCollection (name: string): Promise<Collection> {
    if (!this.client) {
      await this.client.connect()
    }
    return this.client.db().collection(name)
  }
})
