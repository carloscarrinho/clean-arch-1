import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { Encrypter } from '../../protocols/cryptography/encrypter'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'
import { UpdateAccessTokenRepository } from '../../protocols/db/update-access-token-repository'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbAuthentication } from './db-authentication'

const makeSut = ({
  load,
  compare,
  generate,
  update
}: {
  load?: Function
  compare?: Function
  generate?: Function
  update?: Function
}): DbAuthentication => {
  const loadAccountByEmailRepository = {
    load: load ?? jest.fn()
  } as unknown as LoadByAccountRepository

  const hashComparer = {
    compare: compare ?? jest.fn()
  } as unknown as HashComparer

  const encrypter = {
    generate: generate ?? jest.fn()
  } as unknown as Encrypter

  const updateAccessTokenRepository = {
    update: update ?? jest.fn()
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
    const dependencies = { load: jest.fn() }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.load).toHaveBeenCalledWith(credentials.email)
  })

  it('Should throw an error if LoadAccountByEmailRepository throws', async () => {
    // Given
    const dependencies = { load: jest.fn().mockImplementationOnce(() => { throw new Error() }) }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })

  it('Should return null if LoadAccountByEmailRepository does not find account', async () => {
    // Given
    const dependencies = { load: jest.fn().mockResolvedValueOnce(null) }
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
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
      load: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockResolvedValueOnce(accessToken),
      update: jest.fn()
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    await sut.auth(credentials)

    // Then
    expect(dependencies.update).toHaveBeenCalledWith(
      account.id,
      accessToken
    )
  })

  it('Should throw an error if UpdateAccessTokenRepository throws', async () => {
    // Given
    const account = makeAccount()
    const dependencies = {
      load: jest.fn().mockResolvedValueOnce(account),
      compare: jest.fn().mockResolvedValueOnce(true),
      generate: jest.fn().mockResolvedValueOnce(accessToken),
      update: jest.fn().mockImplementationOnce(() => { throw new Error() })
    }
    const sut = makeSut(dependencies)
    const credentials = makeCredentials()

    // When
    const promise = sut.auth(credentials)

    // Then
    await expect(promise).rejects.toThrow()
  })
})
