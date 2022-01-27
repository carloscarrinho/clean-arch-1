import { AuthenticationModel } from '../../../domain/usecases/authentication'
import { LoadByAccountRepository } from '../../protocols/load-by-account-repository'
import { DbAuthentication } from './db-authentication'

const makeSut = ({ load }: { load?: Function}): DbAuthentication => {
  const loadAccountByEmailRepository = {
    load: load ?? jest.fn()
  } as unknown as LoadByAccountRepository

  return new DbAuthentication(loadAccountByEmailRepository)
}

const makeCredentials = (data?: object): AuthenticationModel => ({
  email: 'any_email@mail.com',
  password: 'any_password',
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
    const account = await sut.auth(credentials)

    // Then
    expect(account).toBe(null)
  })
})
