import { InvalidParamError } from '../errors/invalid-param-error'
import { MissingParamError } from '../errors/missing-param-error'
import { EmailValidator } from '../protocols/email-validator'
import { SignUpController } from './signup-controller'

interface SutTypes {
  sut: SignUpController
  emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)

  return { sut, emailValidatorStub }
}

describe('SignUp Controller', () => {
  it('Should return 400 if no name is provided', async () => {
    // Given
    const { sut } = makeSut()
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
    const { sut } = makeSut()
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
    const { sut } = makeSut()
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
    const { sut } = makeSut()
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

  it('Should return 400 if an invalid e-mail is provided', async () => {
    // Given
    const { sut, emailValidatorStub } = makeSut()
    // alternativas para mockar o emailValidatorStub:
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    // emailValidatorStub.isValid = () => false

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })
})
