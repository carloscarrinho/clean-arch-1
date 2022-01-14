import { MongoHelper as sut } from './mongo-helper'

describe('Mongo Helper', () => {
  beforeAll(async () => {
    await sut.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  it('Should reconnect if MongoDB is down', async () => {
    const acccountCollection = sut.getCollection('accounts')
    expect(acccountCollection).toBeTruthy()
    await sut.disconnect()
    expect(acccountCollection).toBeTruthy()
  })
})
