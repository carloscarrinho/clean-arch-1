import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'
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

// ### ALTERNATIVA DE MOCK DO SYSTEM UNDER TEST ###
const makeSut2 = ({ isValid }: {
  isValid?: Function
}): SignUpController => {
  const emailValidatorStub = ({
    isValid
  } as unknown) as EmailValidator

  return new SignUpController(emailValidatorStub)
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

  it('Should call EmailValidator with e-mail provided by request', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, emailValidatorStub } = makeSut()
    // const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const isValidSpy = jest.fn()
    const sut = makeSut2({ isValid: isValidSpy })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'invalid_email@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    sut.handle(httpRequest)

    // Then
    expect(isValidSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  it('Should return 500 when EmailValidator throws an exception', async () => {
    // Given
    const { sut, emailValidatorStub } = makeSut()
    // alternativas para mockar o emailValidatorStub:
    emailValidatorStub.isValid = () => { throw new Error() }

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_email@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
