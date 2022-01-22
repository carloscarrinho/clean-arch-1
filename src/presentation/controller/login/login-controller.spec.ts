import { Authentication } from '../../../domain/usecases/authentication'
import { MissingParamError } from '../../errors'
import { badRequest, internalServerError, success, unauthorized } from '../../helpers/http/http-helper'
import { HttpRequest } from '../../protocols'
import { Validation } from '../signup/signup-protocols'
import { LoginController } from './login-controller'

const makeSut = ({
  validate,
  auth
}: {
  validate?: Function
  auth?: Function
}): LoginController => {
  const validation = ({
    validate: validate ?? jest.fn().mockReturnValue(undefined)
  } as unknown) as Validation

  const authentication = ({
    auth: auth ?? jest.fn().mockResolvedValueOnce('access_token')
  } as unknown) as Authentication

  return new LoginController(validation, authentication)
}

const makeFakeRequest = (data?: object): HttpRequest => ({
  body: {
    email: 'valid_email@mail.com',
    password: 'valid_password',
    ...data
  }
})

describe('Login Controller', () => {
  it('Should call Validation with provided credentials', async () => {
    // Given
    const dependencies = {
      validate: jest.fn()
    }
    const sut = makeSut(dependencies)
    const request = makeFakeRequest()

    // When
    await sut.handle(request)

    // Then
    expect(dependencies.validate).toHaveBeenCalledWith({
      email: request.body.email,
      password: request.body.password
    })
  })

  it('Should return 400 if validation fails', async () => {
    // Given
    const sut = makeSut({ validate: jest.fn().mockReturnValue(new MissingParamError('email')) })
    const request = makeFakeRequest()
    delete request.body.email

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(badRequest(new MissingParamError('email')))
  })

  it('Should call Authentication with provided credentials', async () => {
    // Given
    const dependencies = {
      auth: jest.fn()
    }
    const sut = makeSut(dependencies)
    const request = makeFakeRequest()

    // When
    await sut.handle(request)

    // Then
    expect(dependencies.auth).toHaveBeenCalledWith({
      email: request.body.email,
      password: request.body.password
    })
  })

  it('Should return 401 if invalid credentials are provided', async () => {
    // Given
    const sut = makeSut({
      auth: jest.fn().mockReturnValueOnce(null)
    })
    const request = makeFakeRequest()

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(unauthorized())
  })

  it('Should return 200 if Authentication returns an access token', async () => {
    // Given
    const sut = makeSut({})
    const request = makeFakeRequest()

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(success('access_token'))
  })

  it('Should return 500 if Authentication throws an error', async () => {
    // Given
    const fakeError = new Error()
    fakeError.stack = 'any_stack'
    const dependencies = { auth: jest.fn().mockImplementationOnce(() => { throw fakeError }) }
    const sut = makeSut(dependencies)
    const request = makeFakeRequest()

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(internalServerError(fakeError))
  })
})
