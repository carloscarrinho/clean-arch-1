import { MissingParamError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import { HttpRequest } from '../../protocols'
import { LoginController } from './login-controller'

const makeSut = (): LoginController => {
  return new LoginController()
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
    const sut = makeSut()
    const request = makeFakeRequest({ email: null })
    const expectedResult = badRequest(new MissingParamError('email'))

    // When
    const response = await sut.handle(request)

    // Then
    expect(response).toEqual(expectedResult)
  })
})
