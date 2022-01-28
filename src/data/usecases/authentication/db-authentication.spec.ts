import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { Encrypter } from '../../protocols/cryptography/encrypter'
import { LoadByAccountRepository } from '../../protocols/db/account/load-by-account-repository'
import { UpdateAccessTokenRepository } from '../../protocols/db/account/update-access-token-repository'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbAuthentication } from './db-authentication'

const makeSut = ({
  loadByEmail,
  compare,
  generate,
  updateAccessToken
}: {
  loadByEmail?: Function
  compare?: Function
  generate?: Function
  updateAccessToken?: Function
}): DbAuthentication => {
  const loadAccountByEmailRepository = {
    loadByEmail: loadByEmail ?? jest.fn()
  } as unknown as LoadByAccountRepository

  const hashComparer = {
    compare: compare ?? jest.fn()
  } as unknown as HashComparer

  const encrypter = {
    generate: generate ?? jest.fn()
  } as unknown as Encrypter

  const updateAccessTokenRepository = {
    updateAccessToken: updateAccessToken ?? jest.fn()
  } as unknown as UpdateAccessTokenRepository

  return new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparer,
    encrypter,
    updateAccessTokenRepository
  )
}

const makeCredentials = (data?: object): AuthenticationModel => ({
  email: 'any_email@mail.com',
  password: 'any_password',
  ...data
})

const makeAccount = (data?: object): AccountModel => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'hashed_password',
  ...data
})

const accessToken = 'any_token'

describe('DbAuthentication UseCase', () => {
  it('Should call LoadAccountByEmailRepository with correct credentials', async () => {
    // Given
    const dependencies = { loadByEmail: jest.fn() }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.loadByEmail).toHaveBeenCalledWith(credentials.email)
  })

  it('Should throw an error if LoadAccountByEmailRepository throws', async () => {
    // Given
    const dependencies = { loadByEmail: jest.fn().mockImplementationOnce(() => { throw new Error() }) }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should return null if LoadAccountByEmailRepository does not find account', async () => {
    // Given
    const dependencies = { loadByEmail: jest.fn().mockResolvedValueOnce(null) }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const result = await sut.auth(credentials)

    // Then
    expect(result).toBe(null)
  })

  it('Should call HashComparer with correct values', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn()
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.compare).toHaveBeenCalledWith(
      credentials.password,
      account.password
    )
  })

  it('Should throw an error if HashComparer throws', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockImplementationOnce(() => { throw new Error() })
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should return null if HashComparer returns false', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(false)
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const result = await sut.auth(credentials)

    // Then
    expect(result).toBe(null)
  })

  it('Should call Encrypter with received id', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn()
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.generate).toHaveBeenCalledWith(
      account.id
    )
  })

  it('Should throw an error if Encrypter throws', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockImplementationOnce(() => { throw new Error() })
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should return a token if Encrypter succeeds', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockResolvedValueOnce(accessToken)
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const result = await sut.auth(credentials)

    // Then
    expect(result).toBe(accessToken)
  })

  it('Should call UpdateAccessTokenRepository with id and token', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockResolvedValueOnce(accessToken),
      updateAccessToken: jest.fn()
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.updateAccessToken).toHaveBeenCalledWith(
      account.id,
      accessToken
    )
  })

  it('Should throw an error if UpdateAccessTokenRepository throws', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      loadByEmail: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockResolvedValueOnce(accessToken),
      updateAccessToken: jest.fn().mockImplementationOnce(() => { throw new Error() })
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })
})
