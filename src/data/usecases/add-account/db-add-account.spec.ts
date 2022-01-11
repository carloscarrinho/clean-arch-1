import { Encrypter } from '../../protocols/encrypter'
import { DbAddAccount } from './db-add-account'

const makeEncrypter = (): Encrypter => {
  class EncryperStub {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => resolve('hashed_password'))
    }
  }
  return new EncryperStub()
}

const makeSut = (): {
  sut: DbAddAccount
  encrypterStub: Encrypter
} => {
  const encrypterStub = makeEncrypter()
  const sut = new DbAddAccount(encrypterStub)
  return { sut, encrypterStub }
}

describe('DbAddAccount Usecase', () => {
  it('Should call Encrypter with provided password', async () => {
    // Given
    const { sut, encrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    }

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
})
