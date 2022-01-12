import { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    console.log('accountData >> ', accountData)
    const accountsCollection = MongoHelper.getCollection('accounts')
    const { insertedId } = await accountsCollection.insertOne(accountData)
    const account = {
      id: insertedId.toString(),
      name: accountData.name,
      email: accountData.email,
      password: accountData.password
    }
    return account
  }
}
