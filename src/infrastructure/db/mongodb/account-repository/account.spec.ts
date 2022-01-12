import { AccountMongoRepository } from './account'
import { MongoHelper } from '../helpers/mongo-helper'

describe('AccountMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  it('Should return an account on success', async () => {
    const sut = new AccountMongoRepository()
    const accountData = {
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'hashed_password'
    }

    const account = await sut.add(accountData)

    console.log('account #2 >> ', account)

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toEqual(accountData.name)
    expect(account.email).toEqual(accountData.email)
    expect(account.password).toEqual(accountData.password)
  })
})