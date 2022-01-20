import { InvalidParamError, MissingParamError } from '../../errors'
import { badRequest, internalServerError } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { EmailValidator } from '../signup/signup-protocols'
import { LoginController } from './login-controller'

const makeSut = ({
  isValid
}: {
  isValid?: Function
}): LoginController => {
  const emailValidator = ({
    isValid: isValid ?? jest.fn().mockReturnValue(true)
  } as unknown) as EmailValidator

  return new LoginController(emailValidator)
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
})
