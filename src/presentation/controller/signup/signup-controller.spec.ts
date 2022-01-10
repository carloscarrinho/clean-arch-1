import { SignUpController } from './signup-controller'
import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { EmailValidator, AddAccount, AccountModel, AddAccountModel } from './signup-protocols'

// ### SUGESTÃO DO MANGUINHO PARA MOCK DO SYSTEM UNDER TEST ###
const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }

  return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add (account: AddAccountModel): AccountModel {
      return {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }
  }
  return new AddAccountStub()
}

const makeSut = (): {
  sut: SignUpController
  emailValidatorStub: EmailValidator
  addAccountStub: AddAccount
} => {
  const emailValidatorStub = makeEmailValidator()
  const addAccountStub = makeAddAccount()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)
  return { sut, emailValidatorStub, addAccountStub }
}

// ### ALTERNATIVA DE MOCK DO SYSTEM UNDER TEST ###
// TODO: make method returns 'happy path' by default
const makeSut2 = ({ isValid, add }: {
  isValid?: Function
  add?: Function
}): SignUpController => {
  const emailValidatorStub = ({
    isValid
  } as unknown) as EmailValidator

  const addAccountStub = ({
    add
  } as unknown) as AddAccount

  return new SignUpController(emailValidatorStub, addAccountStub)
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

  it('Should return 400 if password confirmation fails', async () => {
    // Given
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'anyemail@mail.com',
        password: 'password',
        passwordConfirmation: 'invalid_password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
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
        email: 'any_email@mail.com',
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
    // sugestão do Manguinho para mock do método 'isValid' do emailValidatorStub:
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() })
    // alternativa sem utilizar o Jest:
    // emailValidatorStub.isValid = () => { throw new Error() }

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

  it('Should call AddAccount with validated values', async () => {
    // Given
    // ### mock ensinado pelo Manguinho ###
    // const { sut, addAccountStub } = makeSut()
    // const addSpy = jest.spyOn(addAccountStub, 'add')

    // ### alternativa utilizando o outro mock do System Under Test ###
    const addSpy = jest.fn()
    const sut = makeSut2({
      isValid: () => true,
      add: addSpy
    })

    const httpRequest = {
      body: {
        name: 'any_name',
        email: 'any_valid_email@mail.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }

    // When
    sut.handle(httpRequest)

    // Then
    expect(addSpy).toHaveBeenCalledWith({
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })

  it('Should return 500 when AddAccount throws an exception', async () => {
    // Given
    // sugestão do Manguinho para mock do método 'isValid' do addAccountStub:
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw new Error() })

    // alternativa sem utilizar o Jest:
    // const dependencies = {
    //   isValid: () => true,
    //   add: () => { throw new Error() }
    // }
    // const sut = makeSut2(dependencies)

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

  it('Should return 200 if valid data is provided', async () => {
    // Given
    // sugestão Manguinho:
    const { sut } = makeSut()

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }

    // When
    const httpResponse = sut.handle(httpRequest)

    // Then
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: httpRequest.body.name,
      email: httpRequest.body.email,
      password: httpRequest.body.password
    })
  })
})
