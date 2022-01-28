import { AccountMongoRepository } from './account'
import { MongoHelper } from '../helpers/mongo-helper'
import { Collection } from 'mongodb'

let accountsCollection: Collection

const makeSut = (): AccountMongoRepository => {
  return new AccountMongoRepository()
}

describe('AccountMongoRepository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountsCollection = await MongoHelper.getCollection('accounts')
    await accountsCollection.deleteMany({})
  })

  describe('add()', () => {
    it('Should return an account on add success', async () => {
      const sut = makeSut()
      const accountData = {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'hashed_password'
      }

      const account = await sut.add(accountData)

      expect(account).toBeTruthy()
      expect(account.id).toBeTruthy()
      expect(account.name).toEqual(accountData.name)
      expect(account.email).toEqual(accountData.email)
      expect(account.password).toEqual(accountData.password)
    })
  })

  describe('loadByEmail()', () => {
    it('Should return an account on loadByEmail success', async () => {
      // Given
      const sut = makeSut()
      const accountData = {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'hashed_password'
      }
      const { insertedId } = await accountsCollection.insertOne(accountData)

      // When
      const account = await sut.loadByEmail(accountData.email)

      // Then
      expect(account).toEqual({
        id: insertedId.toString(),
        name: accountData.name,
        email: accountData.email,
        password: accountData.password
      })
    })

    it('Should return null if loadByEmail fails', async () => {
      // Given
      const sut = makeSut()

      // When
      const account = await sut.loadByEmail('any_email@mail.com')

      // Then
      expect(account).toBeFalsy()
    })
  })
})
