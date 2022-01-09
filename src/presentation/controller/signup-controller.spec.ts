import { MissingParamError } from '../errors/missing-param-error'
import { SignUpController } from './signup-controller'

const makeSut = (): SignUpController => {
  return new SignUpController()
}

describe('SignUp Controller', () => {
  it('Should return 400 if no name is provided', async () => {
    // Given
    const sut = makeSut()
    const httpRequest = {
      body: {
        email: 'anyemail@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('Should return 400 if no email is provided', async () => {
    // Given
    const sut = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('Should return 400 if no password is provided', async () => {
    // Given
    const sut = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'anyemail@mail.com',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('Should return 400 if no password confirmation is provided', async () => {
    // Given
    const sut = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'anyemail@mail.com',
        password: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })
})
