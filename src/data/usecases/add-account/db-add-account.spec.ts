import { AddAccountRepository } from '../../protocols/add-account-repository'
import { DbAddAccount } from './db-add-account'
import { AccountModel, AddAccountModel, Encrypter } from './db-add-account-protocols'

const makeEncrypter = (): Encrypter => {
  class EncryperStub {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new EncryperStub()
}

const makeDbAddAccountRepository = (): AddAccountRepository => {
  class DbAddAccountRepositoryStub implements AddAccountRepository {
    async add (account: AddAccountModel): Promise<AccountModel> {
      return await new Promise(resolve => resolve({
        id: 'valid_id',
        name: account.name,
        email: account.email,
        password: 'hashed_password'
      }))
    }
  }

  return new DbAddAccountRepositoryStub()
}

const makeSut = (): {
  sut: DbAddAccount
  encrypterStub: Encrypter
  dbAddAccountRepositoryStub: AddAccountRepository
} => {
  const encrypterStub = makeEncrypter()
  const dbAddAccountRepositoryStub = makeDbAddAccountRepository()
  const sut = new DbAddAccount(encrypterStub, dbAddAccountRepositoryStub)
  return { sut, encrypterStub, dbAddAccountRepositoryStub }
}

const makeDefaultAccountData = (data?: Partial<AddAccountModel>): AddAccountModel => ({
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password',
  ...data
})

describe('DbAddAccount Usecase', () => {
  it('Should call Encrypter with provided password', async () => {
    // Given
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = makeDefaultAccountData()

    // When
    await sut.add(accountData)

    // Then
    expect(encryptSpy).toHaveBeenCalledWith(accountData.password)
  })

  it('Should throw an Error if Encrypter throws', async () => {
    // Given
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )
    const accountData = makeDefaultAccountData()

    // When
    const promise = sut.add(accountData)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should call AddAccountRepository with correct values', async () => {
    // Given
    const { sut, encrypterStub, dbAddAccountRepositoryStub } = makeSut()

    const hashedPassword = 'hashed_password'
    jest.spyOn(encrypterStub, 'encrypt').mockResolvedValue(hashedPassword)

    const addSpy = jest.spyOn(dbAddAccountRepositoryStub, 'add')

    const accountData = makeDefaultAccountData()

    // When
    await sut.add(accountData)

    // Then
    expect(addSpy).toHaveBeenCalledWith({
      name: accountData.name,
      email: accountData.email,
      password: hashedPassword
    })
  })

  it('Should throw an Error if AddAccountRespository throws', async () => {
    // Given
    const { sut, dbAddAccountRepositoryStub } = makeSut()
    jest.spyOn(dbAddAccountRepositoryStub, 'add').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    )
    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

    // When
    const promise = sut.add(accountData)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should return an account on success', async () => {
    // Given
    const { sut } = makeSut()

    const accountData = makeDefaultAccountData()

    // When
    const account = await sut.add(accountData)

    // Then
    expect(account).toEqual({
      id: 'valid_id',
      name: accountData.name,
      email: accountData.email,
      password: 'hashed_password'
    })
  })
})
