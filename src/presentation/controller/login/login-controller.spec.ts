import { Authentication } from '../../../domain/usecases/authentication'
import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, internalServerError, success, unauthorized } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'
import { LoginController } from './login-controller'

const makeSut = ({
  isValid,
  auth
}: {
  isValid?: Function
  auth?: Function
}): LoginController => {
  const emailValidator = ({
    isValid: isValid ?? jest.fn().mockReturnValue(true)
  } as unknown) as EmailValidator

  const authentication = ({
    auth: auth ?? jest.fn().mockResolvedValueOnce('access_token')
  } as unknown) as Authentication

  return new LoginController(emailValidator, authentication)
}

const makeFakeRequest = (data?: object): HttpRequest => ({
  body: {
    email: 'valid_email@mail.com',
    password: 'valid_password',
    ...data
  }
})

describe('Login Controller', () => {
  it('Should return 400 if no e-mail is provided', async () => {
    // Given
    const sut = makeSut({})
    const request = makeFakeRequest({ email: null })
    const expectedResult = badRequest(new MissingParamError('email'))

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(expectedResult)
  })

  it('Should return 400 if no password is provided', async () => {
    // Given
    const sut = makeSut({})
    const request = makeFakeRequest({ password: null })
    const expectedResult = badRequest(new MissingParamError('password'))

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(expectedResult)
  })

  it('Should return 400 if provided e-mail is invalid', async () => {
    // Given
    const sut = makeSut({
      isValid: jest.fn().mockReturnValue(false)
    })
    const request = makeFakeRequest()
    const expectedResult = badRequest(new InvalidParamError('email'))

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(expectedResult)
  })

  it('Should call EmailValidator with provided e-mail', async () => {
    // Given
    const dependencies = { isValid: jest.fn() }
    const sut = makeSut(dependencies)
    const request = makeFakeRequest()

    // When
    await sut.handle(request)

    // Then
    expect(dependencies.isValid).toHaveBeenCalledWith(request.body.email)
  })

  it('Should return 500 if EmailValidator throws an error', async () => {
    // Given
    const fakeError = new Error()
    fakeError.stack = 'any_stack'
    const dependencies = { isValid: jest.fn().mockImplementationOnce(() => { throw fakeError }) }
    const sut = makeSut(dependencies)
    const request = makeFakeRequest()

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(internalServerError(fakeError))
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
    expect(dependencies.auth).toHaveBeenCalledWith(
      request.body.email,
      request.body.password
    )
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
