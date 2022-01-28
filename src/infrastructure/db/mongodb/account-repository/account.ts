import { AddAccountRepository } from '../../../../data/protocols/db/add-account-repository'
import { LoadByAccountRepository } from '../../../../data/protocols/db/load-by-account-repository'
import { AccountModel } from '../../../../domain/models/account'
import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helper'

export class AccountMongoRepository implements AddAccountRepository, LoadByAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountsCollection = await MongoHelper.getCollection('accounts')
    const { insertedId } = await accountsCollection.insertOne(accountData)
    return {
      id: insertedId.toString(),
      name: accountData.name,
      email: accountData.email,
      password: accountData.password
    }
  }

  async loadByEmail (email: string): Promise<AccountModel> {
    const accountsCollection = await MongoHelper.getCollection('accounts')
    const account = await accountsCollection.findOne({ email })

    if (!account) return null

    return {
      id: account._id.toString(),
      name: account.name,
      email: account.email,
      password: account.password
    }
  }
}
