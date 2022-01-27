import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { HashComparer } from '../../protocols/cryptography/hash-comparer'
import { TokenGenerator } from '../../protocols/cryptography/token-generator'
import { LoadByAccountRepository } from '../../protocols/db/load-by-account-repository'
import { AccountModel } from '../add-account/db-add-account-protocols'
import { DbAuthentication } from './db-authentication'

const makeSut = ({
  load,
  compare,
  generate
}: {
  load?: Function
  compare?: Function
  generate?: Function
}): DbAuthentication => {
  const loadAccountByEmailRepository = {
    load: load ?? jest.fn()
  } as unknown as LoadByAccountRepository

  const hashComparer = {
    compare: compare ?? jest.fn()
  } as unknown as HashComparer

  const tokenGenerator = {
    generate: generate ?? jest.fn()
  } as unknown as TokenGenerator

  return new DbAuthentication(
    loadAccountByEmailRepository,
    hashComparer,
    tokenGenerator
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

  it('Should call TokenGenerator with received id', async () => {
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

  it('Should throw an error if TokenGenerator throws', async () => {
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
})
