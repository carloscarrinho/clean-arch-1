import { MongoClient } from 'mongodb'

export const MongoHelper = ({
  mongoClient: null as MongoClient,

  async connect (url: string): Promise<void> {
    this.mongoClient = await MongoClient.connect(process.env.MONGO_URL)
  },

  async disconnect (): Promise<void> {
    await this.mongoClient.close()
  }
})
